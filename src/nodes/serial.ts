import { IButtonWidget } from '../litegraph/litegraph.js';
import { LiteGraph } from '../litegraph/litegraph.ts';

import { LGraphNode } from '../litegraph/litegraph-node.js';

export class Serial extends LGraphNode {
  connectButton: IButtonWidget;
  button: IButtonWidget;
  knownPorts: SerialPort[] = [];

  writer?: WritableStreamDefaultWriter;
  activePort: SerialPort | null = null;
  constructor() {
    super();

    this.addInput('onEvent', LiteGraph.ACTION);

    // Signal inputs
    this.addInput('dataTerminalReady', 'boolean');
    this.addInput('requestToSend', 'boolean');
    this.addInput('break', 'boolean');

    // Signal outputs
    this.addOutput('clearToSend', 'boolean');
    this.addOutput('dataCarrierDetect', 'boolean');
    this.addOutput('dataSetReady', 'boolean');
    this.addOutput('ringIndicator', 'boolean');

    this.addOutput('tx', 'ReadableStream');

    // TODO: make these better, like proper combo options & allowed precision
    this.properties = {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      bufferSize: 256,
      flowControl: 'none',
    };

    this.connectButton = this.addWidget<IButtonWidget>('button', '...', null);
    this.button = this.addWidget<IButtonWidget>('button', 'test', null);
    this.button.callback = this.sendData.bind(this);

    this.disableConnectButton();

    // Automatically connect to the previously connected port
    navigator.serial.addEventListener('connect', (e) => {
      e.target && this.establishConnection(e.target as SerialPort);
    });

    navigator.serial.getPorts().then((ports) => {
      this.knownPorts = ports ?? [];

      if (ports.length > 0) {
        this.establishConnection(ports[0]);
        return;
      }

      this.enableConnectButton();
    });
  }
  title = 'Serial';

  onAction(action: string, data: any) {
    console.log('onEvent', action, data);
  }

  async onConnectClick() {
    // TODO: add filtering options & related node inputs, https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
    const port = await navigator.serial.requestPort().catch(() => {
      return null;
    });

    if (!port) {
      return;
    }

    for (const knownPort of this.knownPorts) {
      await knownPort.close().catch(() => {});
      await knownPort.forget();
    }

    // Currently only a single port is supported.
    this.knownPorts = [port];
    this.establishConnection(port);
  }

  async establishConnection(port: SerialPort) {
    try {
      if (!port) {
        // TODO: create an assertion error class instead
        throw new Error(
          '[Assertion Error] Cannot establish connection without a port.'
        );
      }

      this.disableConnectButton();

      console.log(this.properties);
      await port.open({
        baudRate: this.properties.baudRate,
        bufferSize: this.properties.bufferSize,
        dataBits: this.properties.dataBits,
        stopBits: this.properties.stopBits,
        parity: this.properties.parity,
        flowControl: this.properties.flowControl,
      });

      this.activePort = port;

      if (!this.activePort.writable) {
        throw new Error('[Assertion Error] Port is not writable.');
      }

      this.resetConn();
      this.writer = this.activePort.writable.getWriter();

      this.enableConnectButton('Disconnect', this.disconnect.bind(this));

      while (this.activePort.readable) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.setOutputData(4, this.activePort.readable);
      }
      this.reader = undefined;
      this.setOutputData(4, null);
    } catch (e) {
      this.enableConnectButton('Failed to connect');
      console.error(e);
    }
  }

  async resetConn() {
    if (!this.activePort) {
      throw new Error('[Assertion Error] No port to send data.');
    }

    // Reset comm
    await this.activePort.setSignals({ dataTerminalReady: true });
    let dataSetReady = false;
    while (!dataSetReady) {
      ({ dataSetReady } = await this.activePort.getSignals());
    }
    // TODO: flush buffers here
    await this.activePort.setSignals({ dataTerminalReady: false });
    console.log('Conn reset');
  }

  async sendData() {
    console.log('sendData');

    if (!this.writer) {
      throw new Error('[Assertion Error] Cannot send data without a writer.');
    }

    await this.writer.ready;

    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);

    const uint8View = new Uint8Array(buffer);
    const encoder = new TextEncoder();
    uint8View.set(encoder.encode('CMDv'), 0);

    view.setUint32(4, 0);
    view.setUint32(8, 0);

    console.log('view', uint8View);

    await this.writer.write(new Uint8Array(buffer));

    await this.writer.ready;
    console.log('CMDv sent');
  }

  async disconnect() {
    try {
      if (!this.activePort) {
        throw new Error('[Assertion Error] No port to disconnect.');
      }

      this.disableConnectButton();

      // This crashes browser
      this.writer?.releaseLock();
      this.reader?.releaseLock();
      this.writer = undefined;
      this.reader = undefined;

      await this.activePort.close();
      this.activePort = null;
      this.enableConnectButton();
    } catch (e) {
      this.enableConnectButton(
        'Failed to disconnect',
        this.disconnect.bind(this)
      );
      console.error(e);
    }

    this.knownPorts = [];
    this.enableConnectButton();
  }

  disableConnectButton(name?: string) {
    this.connectButton.callback = undefined;
    this.connectButton.name = name ?? '...';
  }

  enableConnectButton(name?: string, cb?: () => void) {
    this.connectButton.callback = cb ?? this.onConnectClick.bind(this);
    this.connectButton.name = name ?? 'Connect';
  }

  async onExecute() {
    if (!this.activePort) {
      return;
    }

    try {
      // Handle input signals
      const dtr = this.getInputData<boolean | undefined>(1);
      const rts = this.getInputData<boolean | undefined>(2);
      const brk = this.getInputData<boolean | undefined>(3);

      // Only set signals if any input has changed
      if (dtr !== undefined || rts !== undefined || brk !== undefined) {
        this.activePort.setSignals({
          ...(dtr !== undefined && { dataTerminalReady: dtr }),
          ...(rts !== undefined && { requestToSend: rts }),
          ...(brk !== undefined && { break: brk }),
        });
      }

      // Update output signals
      const signals = await this.activePort.getSignals();

      this.setOutputData(0, signals.clearToSend);
      this.setOutputData(1, signals.dataCarrierDetect);
      this.setOutputData(2, signals.dataSetReady);
      this.setOutputData(3, signals.ringIndicator);
    } catch (e) {
      console.error(e);
    }
  }
}
