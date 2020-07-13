import {
  IQueryParser,
  IQueryStringKeyValues,
  IQueryStringValueParser,
} from '../../query-parser-interfaces';
import querystring from 'querystring';
import { DefaultValueParserInstance } from '../values/DefaultValueParser';

export class DefaultQueryParser implements IQueryParser {
  parse(rawQueryString: string): object {
    const values = this.parseToKeysAndValues(rawQueryString);
    const final = {};
    Object.entries(values).map((i) => {
      const [key, values] = i;
      //@ts-ignore
      final[key] = DefaultValueParserInstance.parse(key, values);
    });
    return final;
  }

  parseToKeysAndValues(rawQueryString: string): IQueryStringKeyValues {
    const final: IQueryStringKeyValues = {};
    Object.entries(querystring.parse(rawQueryString)).map((i) => {
      const [key, value_s] = i;
      if (Array.isArray(value_s)) {
        final[key] = value_s;
      } else {
        final[key] = [value_s as string];
      }
    });

    return final;
  }
}
