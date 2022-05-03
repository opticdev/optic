import { CapturedInteraction } from '../captures';
import { OpenAPIV3 } from '../specs';
import { OperationLocation } from '@useoptic/openapi-utilities';
import { SchemaObject } from '../shapes';
import { Option } from 'ts-results';

export { DocumentedInteractions } from './streams/documented-interactions';
export { OperationPatches, OperationPatch } from './streams/patches';

export type Operation = OpenAPIV3.OperationObject & {
  pathPattern: string;
  method: OpenAPIV3.HttpMethods;
};

export interface DocumentedInteraction {
  interaction: CapturedInteraction;
  operation: Operation;
  specJsonPath: string;
}
