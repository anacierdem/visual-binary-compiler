import { Reader } from '../reader.js';
import {
  type ParsedDocument,
  parseInput,
  Struct,
  Variable,
} from './grammar.js';

/**

struct Packet {
  char type[3];
  char commandId;
  u32 length;
  u8 data[length];
};

Packet packet @ 0x0;

 */

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

type Field = {
  offset: number;
  // TODO: handle all types here
  getData: ((offset: number) => number) | (() => string);
};

class DataReader {
  size: number;
  buffer: ArrayBuffer = new ArrayBuffer(0);
  view: DataView = new DataView(this.buffer);
  fields: Map<string, Field>;

  static getSize(variable: Variable) {
    if (typeof variable.count === 'string') {
      // FIXME: This is not yet implemented
      return 0;
    }

    // TODO: abstract this away?
    switch (variable.type) {
      case 'u8':
      case 'char':
        return variable.count;
      case 'u16':
        return 2 * variable.count;
      case 'u32':
        return 4 * variable.count;
    }
    throw new Error('Unknown type: ' + variable.type);
  }

  constructor(type: Struct) {
    this.size = 0;
    this.fields = new Map();
    for (let field of type.fields) {
      let offset = this.size;
      if (typeof field.count === 'string') {
        // FIXME: This is not yet implemented
        continue;
      }

      let getData: Field['getData'] = () => 0;
      // TODO: abstract this away?
      switch (field.type) {
        case 'u8':
          getData = (offset: number) =>
            new Uint8Array(this.buffer, offset, field.count)[offset];
        case 'char':
          getData = () => {
            const data = new Uint8Array(this.buffer, offset, field.count);
            const decoder = new TextDecoder();
            return decoder.decode(data, { stream: false });
          };
          break;
        case 'u16':
          getData = (offset: number) =>
            new Uint16Array(this.buffer, offset, field.count)[offset];
          break;
        case 'u32':
          getData = (offset: number) =>
            new Uint32Array(this.buffer, offset, field.count)[offset];
          break;
      }

      this.fields.set(field.name, {
        offset,
        getData,
      });
      this.size += DataReader.getSize(field);
    }
  }

  read(data: ArrayBuffer, offset: number) {
    // Not enough data
    if (data.byteLength - offset < this.size) return false;
    // FIXME: Need to handle subtypes here
    this.buffer = data.slice(offset, this.size - offset);
    this.view = new DataView(this.buffer);
    return true;
  }

  get(name: string, offset: number = 0) {
    const fieldDescriptor = this.fields.get(name);
    return fieldDescriptor?.getData(offset);
  }
}

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
  reader: ReadableStreamDefaultReader<ArrayBuffer> | null = null;

  document: ParsedDocument = {};

  async stopReading() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
  }

  async startReading() {
    console.log('READ', this.document);
    const entrypoints = this.document.Variable?.filter(
      ({ at }) => typeof at !== 'undefined'
    );

    if (entrypoints?.length !== 1) {
      throw new Error('Only a single entrypoint is currently allowed');
    }

    const entrypoint = entrypoints[0];
    // TODO: support other types as well
    const entrypointTypes = this.document.Struct?.filter(
      ({ name }) => name == entrypoint.type
    );

    if (entrypointTypes?.length !== 1) {
      throw new Error('Only a single entrypoint type is currently allowed');
    }
    const entrypointType = entrypointTypes[0];

    // TODO: we can move most of this to the parser
    if (typeof entrypoint.at == 'undefined') {
      throw new Error("Entrypoint at doesn't exist");
    }

    if (!entrypointType) {
      throw new Error("Entrypoint type doesn't exist in document");
    }

    const reader = new DataReader(entrypointType);

    try {
      if (!this.stream) throw new Error('No stream to read from');
      this.reader = this.stream.getReader();

      const chunks = [];
      let doneReading = false;

      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          console.log('DONE reading');
          break;
        }

        // Just consume all the remaining data
        if (doneReading) {
          continue;
        }

        // TODO: better if we can partially read & stream here
        chunks.push(value);
        const streamedData = await new Blob(chunks).arrayBuffer();
        if (reader.read(streamedData, entrypoint.at)) {
          doneReading = true;
          console.log(reader.get('type'));
          console.log(reader.get('commandId'));
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
      this.document = parseInput(value);
    }
  }
}
