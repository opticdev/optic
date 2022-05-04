import { CapturedInteraction, CapturedInteractions } from '../../../captures';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { OpenAPIV3 } from '../../../specs';

export interface OperationDiffVisitor<T> {
  (
    interaction: CapturedInteraction,
    spec: T
  ): IterableIterator<OperationDiffResult>;
}

export { visitRequestBody } from './request-body';

export function* visitResponses(
  interaction: CapturedInteraction,
  spec: { [code: string]: OpenAPIV3.ResponseObject }
): IterableIterator<OperationDiffResult> {}
