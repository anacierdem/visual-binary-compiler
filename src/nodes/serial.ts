import {
  IButtonWidget,
  IComboWidget,
  INumberWidget,
  LGraphNode,
} from 'litegraph.js';

export class Serial extends LGraphNode {
  connectButton: IButtonWidget;
  button: IButtonWidget;
  knownPorts: SerialPort[] = [];
  reader?: ReadableStreamDefaultReader;
  writer?: WritableStreamDefaultWriter;
  activePort: SerialPort | null = null;
  constructor() {
    super();

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

    // TODO: implement these
    // TODO: make these better, like proper combo options & allowed precision
    this.addWidget<INumberWidget>(
      'number',
      'baud rate',
      this.properties.baudRate,
      'baudRate'
    );
    this.addWidget<INumberWidget>(
      'number',
      'data bits',
      this.properties.dataBits,
      'dataBits'
    );
    this.addWidget<INumberWidget>(
      'number',
      'stop bits',
      this.properties.stopBits,
      'stopBits'
    );
    this.addWidget<IComboWidget>(
      'combo',
      'parity',
      [this.properties.parity],
      () => {},
      {
        values: ['none', 'even', 'odd'],
      }
    );
    this.addWidget<INumberWidget>(
      'number',
      'buffer size',
      this.properties.bufferSize,
      'bufferSize'
    );
    this.addWidget<IComboWidget>('combo', 'flow control', ['none'], () => {}, {
      values: ['none', 'hardware'],
    });

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

      // Start reading
      while (this.activePort.readable) {
        this.reader = this.activePort.readable.getReader();

        try {
          while (true) {
            console.log('start read');

            const { value, done } = await this.reader.read();
            if (done) {
              console.log('buffer empty');
              break;
            }
            console.log('value', value.toString());
          }
        } catch (error) {
          console.log('read error', error);
        }
      }
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
    let dataSetReady = false;

    while (!dataSetReady) {
      await this.activePort.setSignals({ dataTerminalReady: true });
      ({ dataSetReady } = await this.activePort.getSignals());
    }
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

  onExecute() {}
}
