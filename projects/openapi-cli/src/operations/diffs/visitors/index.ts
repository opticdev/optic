import { CapturedInteraction } from '../../../captures';
import { OperationDiffResult } from '../result';
import { OpenAPIV3 } from '../../../specs';

export interface OperationDiffVisitor<T> {
  (
    interaction: CapturedInteraction,
    spec: T
  ): IterableIterator<OperationDiffResult>;
}

export function* visitRequestBody(
  interaction: CapturedInteraction,
  spec?: OpenAPIV3.RequestBodyObject
): IterableIterator<OperationDiffResult> {}

export function* visitResponses(
  interaction: CapturedInteraction,
  spec: { [code: string]: OpenAPIV3.ResponseObject }
): IterableIterator<OperationDiffResult> {}
