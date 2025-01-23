import { LGraphNode } from "litegraph.js";

export class Number extends LGraphNode {
  value = 0.5;
  constructor() {
    super();
    this.addWidget("slider", "value", this.value, (v) => {
      this.value = v;
      this.setOutputData(0, v);
    }, { min: 0, max: 1 });
    this.addOutput("out", "number");
  }
  title = "Number";

  // onExecute() {
  //   this.setOutputData(0, this.value);
  // }
}

