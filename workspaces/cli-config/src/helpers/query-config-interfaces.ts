export interface IQueryParserConfig {
  parser: string | undefined;
  csv?: CSVArrayParserOptions;
}

//value parsers

export interface CSVArrayParserOptions {
  keys: string[];
}
