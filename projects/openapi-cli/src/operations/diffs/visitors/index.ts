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
export { visitResponses } from './responses';
