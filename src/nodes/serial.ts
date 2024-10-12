import { IComboWidget, LGraphCanvas, LGraphNode, Vector2 } from "litegraph.js";

export class Serial extends LGraphNode {
  portSelector: IComboWidget;
  constructor() {
    super();

    this.portSelector = this.addWidget<IComboWidget>("combo", "PORT", [], () => {}, { values: [] } );

    navigator.serial.addEventListener("connect", (e) => {
      console.log("CONNECT", e);
        // Connect to `e.target` or add it to a list of available ports.
    });
    
    navigator.serial.addEventListener("disconnect", (e) => {
        // Remove `e.target` from the list of available ports.
    });
    
    navigator.serial.getPorts().then((ports) => {
      this.portSelector.options = { values: [] };
      console.log("PORTS", ports);
      // this.portSelector.options.values = ports.map((port) => port.getInfo().usbVendorId);
    });
      
  }
  title = "Serial";

  onExecute() {

  }
  
  onMouseDown(event: MouseEvent, pos: Vector2, graphCanvas: LGraphCanvas): void {
    navigator.serial
      .requestPort()
      .then(async (port) => {
        await port.open({ baudRate: 9600 });
        console.log("OPEN", port.connected);
        // Connect to `port` or add it to the list of available ports.
      })
      .catch((e) => {
        // The user didn't select a port.
      });
  }
}


