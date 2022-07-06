import { OpenAPIV3 } from '../..';
import { SpecDiffResult, SpecDiffResultKind } from '../result';
import { Option } from 'ts-results';

export function* visitMethod(
  method: OpenAPIV3.HttpMethods,
  spec: Option<OpenAPIV3.OperationObject>,
  context: { pathPattern: string }
): IterableIterator<SpecDiffResult> {
  if (spec.none) {
    yield {
      kind: SpecDiffResultKind.UnmatchedMethod,
      subject: method,
      pathPattern: context.pathPattern,
    };
  }
}
