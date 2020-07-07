import {
  IQueryParser,
  IQueryStringValueParser,
} from './query-parser-interfaces';
import { DefaultQueryParser } from './parsers/query-string/DefaultQueryParser';
import { CSVArrayParser } from './parsers/values/CSV-Arrays';
import { IQueryParserConfig } from '@useoptic/cli-config/build/helpers/query-config-interfaces';
import { IApiCliConfig } from '@useoptic/cli-config';

export function buildQueryStringParserFromConfig(
  config: IApiCliConfig
): IQueryParser {
  return buildQueryStringParser(config.interpreters?.query);
}

export function buildQueryStringParser(
  queryConfig?: IQueryParserConfig
): IQueryParser {
  if (queryConfig) {
    const valueParsers = [
      queryConfig.csv && new CSVArrayParser(queryConfig.csv),
    ].filter((i) => Boolean(i)) as IQueryStringValueParser[];

    return new DefaultQueryParser(valueParsers);
  } else {
    return new DefaultQueryParser([]);
  }
}
