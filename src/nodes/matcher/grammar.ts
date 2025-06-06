import { createToken, Lexer, EmbeddedActionsParser } from 'chevrotain';

export type Variable = {
  kind: 'Variable';
  name: string;
  type: string;
  count: number | string;
  at?: number;
  in?: boolean;
  out?: boolean;
};
export type Struct = { kind: 'Struct'; name: string; fields: Variable[] };

export type ParsedDocument = {
  Variable?: Variable[];
  Struct?: Struct[];
};

const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z]\w*/ });

const StructTok = createToken({
  name: 'Struct',
  pattern: /struct/,
  longer_alt: Identifier,
});

const Integer = createToken({ name: 'Integer', pattern: /0|[1-9]\d*/ });
const Hex = createToken({ name: 'Hex', pattern: /0x\d+/ });
const LineEnding = createToken({ name: 'LineEnding', pattern: /;/ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });

const CurlyOpen = createToken({ name: 'CurlyOpen', pattern: /{/ });
const CurlyClose = createToken({ name: 'CurlyClose', pattern: /}/ });

const SquareOpen = createToken({ name: 'SquareOpen', pattern: /\[/ });
const SquareClose = createToken({ name: 'SquareClose', pattern: /\]/ });

const At = createToken({ name: 'At', pattern: /@/ });

// Keywords
const In = createToken({ name: 'In', pattern: /in/ });
const Out = createToken({ name: 'Out', pattern: /out/ });

const WhiteSpace = createToken({
  name: 'WS',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const allTokens = [
  WhiteSpace,

  StructTok,

  Hex,
  Integer,
  LineEnding,
  CurlyOpen,
  CurlyClose,
  Comma,
  SquareOpen,
  SquareClose,
  At,

  In,
  Out,

  // The Identifier must appear after
  Identifier,
];
const myLexer = new Lexer(allTokens);

class MyParser extends EmbeddedActionsParser {
  arrayDeclaration;
  variableDeclaration;
  structDeclaration;
  statement;
  document;
  number;

  constructor() {
    super(allTokens);

    const $ = this;

    this.number = $.RULE('number', () => {
      let self = 0;
      $.OR([
        {
          ALT: () => {
            self = parseInt($.CONSUME2(Integer).image);
          },
        },
        {
          ALT: () => {
            self = parseInt($.CONSUME2(Hex).image);
          },
        },
      ]);
      return self;
    });

    this.arrayDeclaration = $.RULE('arrayDeclaration', () => {
      $.CONSUME2(SquareOpen);
      let size: string | number = 0;
      $.OR([
        {
          ALT: () => {
            size = $.CONSUME2(Identifier).image;
          },
        },
        {
          ALT: () => {
            size = $.SUBRULE(this.number);
          },
        },
      ]);
      $.CONSUME2(SquareClose);
      return size;
    });

    this.variableDeclaration = $.RULE('variableDeclaration', () => {
      const fields: Variable[] = [];
      const type = $.CONSUME1(Identifier).image;

      $.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          const name = $.CONSUME2(Identifier).image;
          let count, at, _in, out;
          $.OPTION(() => {
            count = $.SUBRULE(this.arrayDeclaration);
          });

          $.OPTION1(() => {
            $.OR([
              {
                ALT: () => {
                  $.CONSUME(At);
                  at = $.SUBRULE(this.number);
                },
              },
              {
                ALT: () => {
                  _in = $.CONSUME(In).image;
                },
              },
              {
                ALT: () => {
                  out = $.CONSUME(Out).image;
                },
              },
            ]);
          });

          const field: Variable = {
            kind: 'Variable',
            name,
            type,
            count: 1,
          };

          field.count = count ?? 1;
          typeof at !== 'undefined' && (field.at = at);
          _in && (field.in = true);
          out && (field.out = true);

          fields.push(field);
        },
      });

      return fields;
    });

    this.structDeclaration = $.RULE('structDeclaration', () => {
      let fields: Variable[] = [];
      $.CONSUME(StructTok);
      const name = $.CONSUME(Identifier).image;
      $.CONSUME(CurlyOpen);
      $.MANY(() => {
        const inner = $.SUBRULE($.variableDeclaration);

        // TODO: combine with below
        if (Array.isArray(inner)) {
          fields = fields.concat(inner);
        } else {
          fields.push(inner);
        }
        fields.push();
        $.CONSUME(LineEnding);
      });
      $.CONSUME(CurlyClose);
      return {
        kind: 'Struct',
        name,
        fields: fields.flat(),
      } as Struct;
    });

    this.statement = $.RULE('statement', () => {
      let stmt: Variable[] | Struct;
      $.OR([
        {
          ALT: () => {
            stmt = $.SUBRULE($.variableDeclaration);
          },
        },
        {
          ALT: () => {
            stmt = $.SUBRULE($.structDeclaration);
          },
        },
      ]);
      $.CONSUME(LineEnding);
      return stmt;
    });

    this.document = $.RULE('document', () => {
      let results: (Variable | Struct)[] = [];
      $.MANY(() => {
        const result = $.SUBRULE(this.statement);

        // TODO: combine with above
        if (Array.isArray(result)) {
          results = results.concat(result);
        } else {
          results.push(result);
        }
      });
      return results;
    });

    this.performSelfAnalysis();
  }
}

const myParser = new MyParser();

export function parseInput(text: string) {
  const lexingResult = myLexer.tokenize(text);
  // "input" is a setter which will reset the parser's state.
  myParser.input = lexingResult.tokens;
  const parsed = myParser.document();

  if (myParser.errors.length > 0) {
    console.log('ERRORS', myParser.errors);
  }

  const final: ParsedDocument = Object.groupBy(
    parsed,
    ({ kind }) => kind
  ) as ParsedDocument;
  return final;
}
