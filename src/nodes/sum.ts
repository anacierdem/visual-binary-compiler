import { LGraphNode } from "litegraph.js";

export class Sum extends LGraphNode {
  constructor() {
    super();
    this.addInput("A", "number");
    this.addInput("B", "number");
    this.addOutput("A+B", "number");
    this.properties = { precision: 1 };
  }
  title = "Sum";

  onExecute() {
    var A = this.getInputData(0);
    if (A === undefined) A = 0;
    var B = this.getInputData(1);
    if (B === undefined) B = 0;
    this.setOutputData(0, A + B);
  }
}
