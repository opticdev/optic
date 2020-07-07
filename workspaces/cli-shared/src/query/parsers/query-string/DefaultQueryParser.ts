import {
  IQueryParser,
  IQueryStringKeyValues,
  IQueryStringValueParser,
} from '../../query-parser-interfaces';
import querystring from 'querystring';
import { DefaultValueParserInstance } from '../values/DefaultValueParser';

export class DefaultQueryParser implements IQueryParser {
  valueParsers: IQueryStringValueParser[];

  constructor(parsers: IQueryStringValueParser[]) {
    this.valueParsers = parsers;
  }

  parse(rawQueryString: string): object {
    const values = this.parseToKeysAndValues(rawQueryString);
    const final = {};
    Object.entries(values).map((i) => {
      const [key, values] = i;

      const firstParser = this.valueParsers.find((i) =>
        i.shouldHandle(key, values)
      );
      if (firstParser) {
        // @ts-ignore
        final[key] = firstParser.parse(key, values);
      } else {
        // @ts-ignore
        final[key] = DefaultValueParserInstance.parse(key, values);
      }
    });
    return final;
  }

  parseToKeysAndValues(rawQueryString: string): IQueryStringKeyValues {
    return querystring.parse(rawQueryString) as IQueryStringKeyValues;
  }
}
