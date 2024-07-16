import { ParseResult } from './utils/spec-loaders';

export type CustomUploadFn = (spec: ParseResult) => Promise<void>;
