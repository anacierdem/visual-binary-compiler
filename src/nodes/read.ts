import { LiteGraph } from '../litegraph/litegraph.ts';

import { Reader } from './reader.js';

export class Read extends Reader {
  constructor() {
    super();
    this.addInput('offset', 'number');
    this.addInput('length', 'number');

    this.addOutput('match', 'ArrayBuffer');
    this.addOutput('passthrough', 'ReadableStream');

    this.addOutput('matched', LiteGraph.EVENT);
  }
  title = 'Read';

  reader: ReadableStreamDefaultReader | null = null;

  async stopReading() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
  }

  async startReading() {
    try {
      if (!this.stream) throw new Error('No stream to read from');
      const [stream1, stream2] = this.stream.tee();
      this.setOutputData(2, stream2);
      this.reader = stream1.getReader();

      // TODO: when should we get the length & pos exactly?
      const offset = this.getInputData<number>(1);
      const length = this.getInputData<number>(2);

      if (!offset || !length) {
        throw new Error('No input connection');
      }

      let readBytes = 0;
      const buffer = new ArrayBuffer(length);
      const view = new Uint8Array(buffer);
      // TODO: also move this to the base class
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
      this.triggerSlot(2, buffer);
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
