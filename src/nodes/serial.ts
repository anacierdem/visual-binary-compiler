import {
  IButtonWidget,
  IComboWidget,
  INumberWidget,
  LGraphNode,
} from 'litegraph.js';

export class Serial extends LGraphNode {
  connectButton: IButtonWidget;
  knownPorts: SerialPort[] = [];
  constructor() {
    super();

    this.properties = {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      bufferSize: 256,
      flowControl: 'none',
    };

    this.connectButton = this.addWidget<IButtonWidget>('button', '...', null);

    // TODO: implement these
    this.addWidget<INumberWidget>('number', 'baud rate', 9600, 'baudRate');
    this.addWidget<INumberWidget>('number', 'data bits', 8, 'dataBits');
    this.addWidget<INumberWidget>('number', 'stop bits', 1, 'stopBits');
    this.addWidget<IComboWidget>('combo', 'parity', ['none'], () => {}, {
      values: ['none', 'even', 'odd'],
    });
    this.addWidget<INumberWidget>('number', 'buffer size', 256, 'bufferSize');
    this.addWidget<IComboWidget>('combo', 'flow control', ['none'], () => {}, {
      values: ['none', 'hardware'],
    });

    this.disableConnectButton();

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
      this.enableConnectButton('Disconnect', this.disconnect.bind(this, port));
    } catch (e) {
      this.enableConnectButton('Failed to connect');
      console.error(e);
    }
  }

  async disconnect(port: SerialPort) {
    try {
      this.disableConnectButton();
      await port.close();
      this.enableConnectButton();
    } catch (e) {
      this.enableConnectButton(
        'Failed to disconnect',
        this.disconnect.bind(this, port)
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
