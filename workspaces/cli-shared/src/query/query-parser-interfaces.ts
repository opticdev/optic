export interface IQueryParser {
  parse(rawQueryString: string): object; // this should always return something. bugs should be swallowed.
  parseToKeysAndValues(rawQueryString: string): IQueryStringKeyValues;
}

export interface IQueryStringKeyValues {
  [key: string]: string[];
}

// Query String Value Interfaces

export interface IQueryStringValueParser {
  parse(key: string, values: string[]): any;
  shouldHandle(key: string, values: string[]): boolean;
}
