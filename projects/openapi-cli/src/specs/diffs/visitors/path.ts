import { OpenAPIV3 } from '../..';
import { SpecDiffResult, SpecDiffResultKind } from '../result';
import { Option } from 'ts-results';

export function* visitPath(
  path: string,
  spec: Option<OpenAPIV3.PathItemObject>,
  context: { pathPattern: Option<string> }
): IterableIterator<SpecDiffResult> {
  if (spec.none) {
    yield {
      kind: SpecDiffResultKind.UnmatchedPath,
      subject: path,
    };
  }
}
