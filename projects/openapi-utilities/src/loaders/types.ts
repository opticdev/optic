import { OpenAPIV3 } from "openapi-types";
import { JsonSchemaSourcemap } from "../parser/openapi-sourcemap-parser";

interface SpecLoaded {
  success: boolean;
  flattened?: OpenAPIV3.Document;
  sourcemap?: JsonSchemaSourcemap;
  error?: string;
}

interface SpecLoadedSuccess extends SpecLoaded {
  success: true;
  flattened: OpenAPIV3.Document;
  sourcemap: JsonSchemaSourcemap;
}
interface SpecLoadedError extends SpecLoaded {
  success: false;
  error: string;
}

export type SpecLoaderResult = SpecLoadedSuccess | SpecLoadedError;
