import {OpenAPIV3} from "openapi-types";
import {JsonSchemaSourcemap, JsonSchemaSourcemapOutput} from "../parser/openapi-sourcemap-parser";

interface SpecLoaded {
  success: boolean
  flattened?: OpenAPIV3.Document
  sourcemap?: JsonSchemaSourcemapOutput
  error?: string
}

interface SpecLoadedSuccess extends SpecLoaded {
  success: true
  flattened: OpenAPIV3.Document
  sourcemap: JsonSchemaSourcemapOutput
}
interface SpecLoadedError extends SpecLoaded {
  success: false
  error: string
}

export type SpecLoaderResult = SpecLoadedSuccess | SpecLoadedError

