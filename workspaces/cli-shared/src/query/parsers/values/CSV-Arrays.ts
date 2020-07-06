import { IQueryStringValueParser } from '../../query-parser-interfaces';
import { CSVArrayParserOptions } from '@useoptic/cli-config/build/helpers/query-config-interfaces';

export class CSVArrayParser implements IQueryStringValueParser {
  options: CSVArrayParserOptions;
  constructor(options: CSVArrayParserOptions) {
    this.options = options;
  }

  parse(key: string, values: string[]): any {
    const firstValue = values[0];
    return firstValue.split(/,\s*/);
  }

  shouldHandle(key: string, values: string[]): boolean {
    if (
      Array.isArray(this.options.keys) &&
      this.options.keys.includes(key) &&
      values.length === 1
    ) {
      return true;
    } else {
      return false;
    }
  }
}
