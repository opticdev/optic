import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { Option } from 'ts-results';

export function* visitMethod(
  method: OpenAPIV3.HttpMethods,
  spec: Option<OpenAPIV3.OperationObject>,
  context: { pathPattern: string }
): IterableIterator<OperationDiffResult> {
  if (spec.none) {
    yield {
      kind: OperationDiffResultKind.UnmatchedMethod,
      subject: method,
      pathPattern: context.pathPattern,
    };
  }
}
