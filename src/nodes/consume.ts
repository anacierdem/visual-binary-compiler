import { LiteGraph, LGraphNode } from '../litegraph/litegraph.js';

export class Consume extends LGraphNode {
  constructor() {
    super();
    this.addInput('in', 'ReadableStream');

    this.addOutput('match', 'ReadableStream');
    this.addOutput('rest', 'ReadableStream');
  }
  title = 'Consume';

  stream?: ReadableStream;
  reader?: ReadableStreamDefaultReader;

  async onConnectionsChange(type, i, connected, info, input) {
    if (type === LiteGraph.INPUT) {
      // TODO: also check which input
      if (connected) {
        if (info.data) {
          this.stream = info.data;
        } else {
          // FIXME: why this is needed except for the initial establish connection?
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

  async stopReading() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
  }

  async startReading() {
    try {
      this.reader = this.stream.getReader();
      let cmd = '';
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          console.log('DONE reading');
          break;
        }
        cmd += decoder.decode(value, { stream: true });

        if (cmd.length >= 4) {
          // TODO: actually handle the command
          console.log('command', cmd.slice(0, 12));
          cmd = cmd.slice(12);
        }
      }
    } catch (error) {
      console.log('read error', error);
      if (error instanceof TypeError) {
        this.disconnectInput(0);
      }
    } finally {
      this.reader?.releaseLock();
    }
  }
}
