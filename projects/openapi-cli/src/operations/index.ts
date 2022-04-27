import { CapturedInteraction } from '../captures';
import { OpenAPIV3 } from '../specs';
import { OperationLocation } from '@useoptic/openapi-utilities';
import { SchemaObject } from '../shapes';

export type Operation = OpenAPIV3.OperationObject & {
  path: string;
  method: OpenAPIV3.HttpMethods;
};

export interface DocumentedInteraction {
  interaction: CapturedInteraction;
  operation: Operation;
  specJsonPath: string;
}
