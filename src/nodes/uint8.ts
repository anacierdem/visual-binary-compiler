import { LGraphNode } from '../litegraph/litegraph-node.js';

export class Uint8 extends LGraphNode {
  constructor() {
    super();
    this.addInput('in', 'ArrayBuffer');
  }
  title = 'Uint8';

  view?: Uint8Array;

  onExecute() {
    const inData = this.getInputData(0);
    if (inData instanceof ArrayBuffer) {
      this.view = new Uint8Array(inData);
      console.log('Read uint8', this.view);
    }
  }
}
