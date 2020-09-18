declare module 'stream-json/jsonl/Parser' {
  import { Transform, TransformOptions } from 'stream';

  export = Parser;

  declare class Parser extends Transform {
    constructor(options?: Parser.ParserOptions);
  }

  declare namespace Parser {
    interface ParserOptions extends TransformOptions {
      packValues?: boolean;
      packKeys?: boolean;
      packStrings?: boolean;
      packNumbers?: boolean;
      streamValues?: boolean;
      streamKeys?: boolean;
      streamStrings?: boolean;
      streamNumbers?: boolean;
      jsonStreaming?: boolean;
    }

    function make(options?: ParserOptions): Parser;

    namespace make {
      type Constructor = Parser;
      const Constructor: typeof Parser;
    }

    function parser(options?: ParserOptions): Parser;

    namespace parser {
      type Constructor = Parser;
      const Constructor: typeof Parser;
    }
  }
}

declare module 'stream-json/jsonl/Stringer' {
  import { Transform, TransformOptions } from 'stream';

  export = Stringer;

  declare class Stringer extends Transform {
    constructor(options?: Stringer.StringerOptions);
  }

  declare namespace Stringer {
    interface StringerOptions extends TransformOptions {
      useValues?: boolean;
      useKeyValues?: boolean;
      useStringValues?: boolean;
      useNumberValues?: boolean;
      makeArray?: boolean;
    }

    function make(options?: StringerOptions): Stringer;

    namespace make {
      type Constructor = Stringer;
      const Constructor: typeof Stringer;
    }

    function stringer(options?: StringerOptions): Stringer;

    namespace stringer {
      type Constructor = Stringer;
      const Constructor: typeof Stringer;
    }
  }
}
