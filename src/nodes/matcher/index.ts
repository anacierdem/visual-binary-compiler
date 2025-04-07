import { Reader } from '../reader.js';
import { parseInput } from './grammar.js';

export class Matcher extends Reader {
  constructor(title: string) {
    super();

    this.addProperty('pattern', 'return A;');

    this.addOutput('match', 'ReadableStream');
    this.addOutput('rest', 'ReadableStream');
  }

  static widgets_info = {
    pattern: { type: 'code' },
  };

  title = 'Matcher';

  stream: ReadableStream | null = null;
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

  onPropertyChanged(name: string, value: string) {
    if (name === 'pattern') {
      console.log('onPropertyChanged', parseInput(value));
    }
  }
}
