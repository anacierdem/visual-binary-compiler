import { LiteGraph, LGraphNode } from '../litegraph/litegraph.js';

export abstract class Reader extends LGraphNode {
  constructor() {
    super();
    this.addInput('in', 'ReadableStream');
  }

  stream: ReadableStream | null = null;

  async onConnectionsChange(type, i, connected, info, input) {
    if (type === LiteGraph.INPUT) {
      // Readable stream input
      if (i != 0) return;
      if (connected) {
        if (info.data) {
          this.stream = info.data;
        } else {
          // FIXME: why this is needed except for the initial establish connection?
          // FIXME: This creates a race condition with the disconnect event
          while (!info.data) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          this.stream = info.data;
        }

        this.startReading();
      } else if (info.data.locked) {
        this.stopReading();
        this.stream = null;
      }
    }
  }

  abstract startReading(): void;
  abstract stopReading(): void;
}
