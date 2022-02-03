import { Operation } from 'fast-json-patch';

export interface RoundtripProvider<Config> {
  name: string;
  fileExtensions: string[];
  inferConfig: (contents: string) => Promise<Config>;
  parse: (filepath: string, contents: string) => Promise<ParseResult>;
  applyPatches: (
    filePath: string,
    operations: Operation[],
    config?: Config
  ) => Promise<PatchApplyResult>;
}

// Results & Errors

export type ParseResult =
  | { value: any; success: true }
  | { error: string; success: false };

export type PatchApplyResult =
  | { value: any; asString: string; success: true }
  | { error: string; success: false };

// Reducer

export type ReduceOperationType = { contents: string; currentValue: string };
