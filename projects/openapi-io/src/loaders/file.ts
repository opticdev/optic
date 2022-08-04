import { SpecLoaderResult } from "./types";
import {
  parseOpenAPIWithSourcemap,
} from "../parser/openapi-sourcemap-parser";
import * as path from "path";
import { JsonSchemaSourcemap } from "../parser/sourcemap";

export async function loadSpecFromFile(
  specFilePath: string,
  includeSourcemap: boolean = true
): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIWithSourcemap(path.resolve(specFilePath));
    return {
      success: true,
      flattened: results.jsonLike,
      sourcemap: includeSourcemap
        ? results.sourcemap
        : new JsonSchemaSourcemap(specFilePath),
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
export async function loadSpecFromUrl(
  url: string,
  includeSourcemap: boolean = true
): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIWithSourcemap(url);
    return {
      success: true,
      flattened: results.jsonLike,
      sourcemap: includeSourcemap
        ? results.sourcemap
        : new JsonSchemaSourcemap(url),
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
