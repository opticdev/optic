import { ParseResult } from './utils/spec-loaders';
export type { OpticCliConfig } from './config';
export type CustomUploadFn = (spec: ParseResult) => Promise<void>;
