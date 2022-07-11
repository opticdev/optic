import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { Option } from 'ts-results';

export function* visitPath(
  path: string,
  spec: Option<OpenAPIV3.PathItemObject>,
  context: { pathPattern: Option<string> }
): IterableIterator<OperationDiffResult> {
  if (spec.none) {
    yield {
      kind: OperationDiffResultKind.UnmatchedPath,
      subject: path,
    };
  }
}
