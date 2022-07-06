import { OpenAPIV3 } from '../..';
import { SpecDiffResult } from '../result';
import { Option } from 'ts-results';

export function* visitPath(
  input: string,
  spec: Option<OpenAPIV3.PathItemObject>,
  context: { pathPattern: Option<string> }
): IterableIterator<SpecDiffResult> {}
