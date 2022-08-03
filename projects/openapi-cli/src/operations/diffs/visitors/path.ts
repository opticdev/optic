import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { PathComponents, PathComponent } from '../..';
import { Option } from 'ts-results';

export function* visitPath(
  path: string,
  specOption: Option<OpenAPIV3.PathItemObject>,
  context: { pathPattern: Option<string> }
): IterableIterator<OperationDiffResult> {
  if (specOption.none) {
    yield {
      kind: OperationDiffResultKind.UnmatchedPath,
      subject: path,
    };
  }

  // TODO: match path's parameters against those documented
  // let parameterComponents = PathComponents.fromPath(path).filter(
  //   PathComponent.isTemplate
  // );
  // const spec = specOption.unwrap()
  // spec.parameters
}
