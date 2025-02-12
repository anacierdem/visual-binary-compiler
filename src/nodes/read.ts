import { LiteGraph, LGraphNode } from '../litegraph/litegraph.js';

export class Read extends LGraphNode {
  constructor() {
    super();
    this.addInput('in', 'ReadableStream');
    this.addInput('offset', 'number');
    this.addInput('length', 'number');

    this.addOutput('match', 'ArrayBuffer');
    this.addOutput('passthrough', 'ReadableStream');
  }
  title = 'Read';

  stream?: ReadableStream;
  reader?: ReadableStreamDefaultReader;

  // TODO: extend a common base class with consume
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

  async stopReading() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
  }

  async startReading() {
    try {
      const [stream1, stream2] = this.stream.tee();
      this.setOutputData(2, stream2);
      this.reader = stream1.getReader();

      // TODO: when should we get the length & pos exactly?
      const offset = this.getInputData<number>(1);
      const length = this.getInputData<number>(2);

      let readBytes = 0;
      const buffer = new ArrayBuffer(length);
      const view = new Uint8Array(buffer);
      while (readBytes < length + offset) {
        const { value, done } = await this.reader.read();
        if (done) {
          console.log('DONE reading');
          break;
        }

        if (readBytes + value.length >= offset) {
          const into = Math.max(0, readBytes - offset);
          const source = new Uint8Array(
            value.buffer,
            Math.max(0, offset - readBytes),
            Math.min(value.length, length - into)
          );
          view.set(source, into);
        }

        readBytes = readBytes + value.length;
      }
      this.setOutputData(0, buffer);
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
