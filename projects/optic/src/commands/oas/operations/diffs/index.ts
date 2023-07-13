import { Operation } from '..';
import { CapturedInteraction } from '../../../capture/sources/captured-interactions';
import { OpenAPIV3 } from '../../specs';
import { OperationDiffResult, OperationDiffResultKind } from './result';
import {
  OperationInteractionDiffTraverser,
  SpecOperationDiffTraverser,
} from './traversers';

export type { OperationDiffResult };
export { OperationDiffResultKind };

export function* diffInteractionByOperation(
  interaction: CapturedInteraction,
  operation: Operation
): IterableIterator<OperationDiffResult> {
  const traverser = new OperationInteractionDiffTraverser();
  traverser.traverse(interaction, operation);
  yield* traverser.results();
}

export function* diffOperationWithSpec(
  operation: {
    pathPattern: string;
    methods: OpenAPIV3.HttpMethods[];
  },
  spec: OpenAPIV3.Document
): IterableIterator<OperationDiffResult> {
  const traverser = new SpecOperationDiffTraverser();
  traverser.traverse(operation, spec);
  yield* traverser.results();
}
