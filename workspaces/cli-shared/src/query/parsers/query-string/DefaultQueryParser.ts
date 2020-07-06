import {
  IQueryParser,
  IQueryStringKeyValues,
  IQueryStringValueParser,
} from '../../query-parser-interfaces';
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
    return querystring(rawQueryString);
  }
}

function querystring(query: string): IQueryStringKeyValues {
  let parser = /([^=?&]+)=?([^&]*)/g,
    result = {},
    part;

  const pastKeys: string[] = [];

  while ((part = parser.exec(query))) {
    let key = decode(part[1]),
      value = decode(part[2]);

    if (
      key === null ||
      value === null ||
      (key in result && !pastKeys.includes(key))
    ) {
      console.log(`skipping extra ${key}`);
      continue;
    }

    // @ts-ignore
    if (result[key]) {
      // @ts-ignore
      result[key].push(value);
    } else {
      pastKeys.push(key);
      // @ts-ignore
      result[key] = [value];
    }
  }

  return result;
}

function decode(input: string) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}
