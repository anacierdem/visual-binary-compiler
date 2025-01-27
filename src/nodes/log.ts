import { LGraphNode } from '../litegraph/litegraph.js';

export class Log extends LGraphNode {
  constructor() {
    super();
    this.addInput('A', 'number');
  }
  title = 'Console.log';

  onExecute() {
    var A = this.getInputData(0);
    if (A !== undefined) console.log(A);
  }
}
