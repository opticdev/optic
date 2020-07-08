import { IQueryParser } from './query-parser-interfaces';
import { DefaultQueryParser } from './parsers/query-string/DefaultQueryParser';

export function buildQueryStringParser(): IQueryParser {
  return new DefaultQueryParser();
}
