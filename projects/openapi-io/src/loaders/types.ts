import { OpenAPI } from 'openapi-types';
import { JsonSchemaSourcemap } from '../parser/sourcemap';

interface SpecLoaded {
  success: boolean;
  flattened?: OpenAPI.Document;
  sourcemap?: JsonSchemaSourcemap;
  error?: string;
}

interface SpecLoadedSuccess extends SpecLoaded {
  success: true;
  flattened: OpenAPI.Document;
  sourcemap: JsonSchemaSourcemap;
}
interface SpecLoadedError extends SpecLoaded {
  success: false;
  error: string;
}

export type SpecLoaderResult = SpecLoadedSuccess | SpecLoadedError;
