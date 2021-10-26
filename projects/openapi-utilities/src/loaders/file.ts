import {SpecLoaderResult} from "./types";
import { parseOpenAPIWithSourcemap} from "../parser/openapi-sourcemap-parser";
import * as path from "path";

export async function loadSpecFromFile(specFilePath: string): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIWithSourcemap(path.resolve(specFilePath))
    return { success: true, flattened: results.jsonLike, sourcemap: results.sourcemap }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
export async function loadSpecFromUrl(url: string): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIWithSourcemap(url)
    return { success: true, flattened: results.jsonLike, sourcemap: results.sourcemap }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
