export interface Coordinates {
  absoluteJsonPath: string;
  // some location required
  filesystem?: {
    filePath: string;
    line: string;
  };
  codehost?: {
    url: string;
  };
}
