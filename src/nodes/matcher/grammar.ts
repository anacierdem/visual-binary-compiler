import { createToken, Lexer, EmbeddedActionsParser } from 'chevrotain';
// import * as util from 'util';

const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z]\w*/ });

const Struct = createToken({
  name: 'Struct',
  pattern: /struct/,
  longer_alt: Identifier,
});

const Integer = createToken({ name: 'Integer', pattern: /0|[1-9]\d*/ });
const LineEnding = createToken({ name: 'LineEnding', pattern: /;/ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });

const CurlyOpen = createToken({ name: 'CurlyOpen', pattern: /{/ });
const CurlyClose = createToken({ name: 'CurlyClose', pattern: /}/ });

const SquareOpen = createToken({ name: 'SquareOpen', pattern: /\[/ });
const SquareClose = createToken({ name: 'SquareClose', pattern: /\]/ });

const WhiteSpace = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const allTokens = [
  WhiteSpace,
  // "keywords" appear before the Identifier
  Struct,
  // The Identifier must appear after the keywords because all keywords are valid identifiers.
  Identifier,
  Integer,
  LineEnding,
  CurlyOpen,
  CurlyClose,
  Comma,
  SquareOpen,
  SquareClose,
];
const myLexer = new Lexer(allTokens);

class MyParser extends EmbeddedActionsParser {
  constructor() {
    super(allTokens);

    const $ = this;

    const arrayDeclaration = $.RULE('arrayDeclaration', () => {
      $.CONSUME2(SquareOpen);
      let size;
      $.OR([
        {
          ALT: () => {
            size = $.CONSUME2(Identifier).image;
          },
        },
        {
          ALT: () => {
            size = parseInt($.CONSUME2(Integer).image);
          },
        },
      ]);
      $.CONSUME2(SquareClose);
      return size;
    });

    const fieldDeclaration = $.RULE('fieldDeclaration', () => {
      const fields = [];
      const type = $.CONSUME1(Identifier).image;

      $.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          const name = $.CONSUME2(Identifier).image;
          let size;
          $.OPTION(() => {
            size = $.SUBRULE(arrayDeclaration);
          });

          const field: { name: string; type: string; size?: number | string } =
            {
              name,
              type,
            };

          size && (field.size = size);

          fields.push(field);
        },
      });
      $.CONSUME(LineEnding);

      return fields;
    });

    const structDefinition = $.RULE('structDefinition', () => {
      const fields = [];
      $.CONSUME(Struct);
      const name = $.CONSUME(Identifier).image;
      $.CONSUME(CurlyOpen);
      $.MANY(() => fields.push($.SUBRULE(fieldDeclaration)));
      $.CONSUME(CurlyClose);
      return {
        name,
        fields: fields.flat(),
      };
    });

    const document = $.RULE('document', () => {
      const structs = [];
      $.MANY(() => {
        structs.push($.SUBRULE(structDefinition));
        $.CONSUME(LineEnding);
      });
      return {
        structs,
      };
    });

    this.performSelfAnalysis();
  }
}

const myParser = new MyParser();

export function parseInput(text: string) {
  const lexingResult = myLexer.tokenize(text);
  // "input" is a setter which will reset the parser's state.
  myParser.input = lexingResult.tokens;
  const res = myParser.document();

  if (myParser.errors.length > 0) {
    console.log('ERRORS', myParser.errors);
  }
  return res;
}

const text = `
struct MyStruct {
  Type type;
  u16 len;
  u32 x, y[len], z;
  double a[2];
};
struct MyStruct {
  Type type;
  u16 len;
  u32 x, y[len], z;
  double a[2];
};
`;

// console.log(util.inspect(parseInput(text), false, null));
