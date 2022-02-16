import { OpenAPIV3 } from '../specs/index';

export interface Body {
  contentType: string;
  value: any;
}

export type SchemaObject = OpenAPIV3.SchemaObject;

export interface DocumentedBody {
  body: Body;
  schema: SchemaObject | null;
}
