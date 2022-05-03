import { CapturedInteraction } from '../captures';
import { OpenAPIV3 } from '../specs';

export { DocumentedInteractions } from './streams/documented-interactions';
export { OperationPatches } from './streams/patches';
export { OperationPatch } from './patches';

export type Operation = OpenAPIV3.OperationObject & {
  pathPattern: string;
  method: OpenAPIV3.HttpMethods;
};

export interface DocumentedInteraction {
  interaction: CapturedInteraction;
  operation: Operation;
  specJsonPath: string;
}
