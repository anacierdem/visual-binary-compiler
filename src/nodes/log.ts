import { LGraphNode } from '../litegraph/litegraph-node';

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
