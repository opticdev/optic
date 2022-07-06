import { OpenAPIV3 } from '../..';
import { SpecDiffResult } from '../result';
import { Option } from 'ts-results';

export function* visitMethod(
  input: string,
  spec: Option<OpenAPIV3.OperationObject>,
  context: { pathPattern: string }
): IterableIterator<SpecDiffResult> {}
