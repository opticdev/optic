import { SpecLoaderResult } from "./types";
import { parseOpenAPIWithSourcemap, parseOpenAPIFromUrlWithSourcemap } from "../parser/openapi-sourcemap-parser";
import * as path from "path";
import tap from "tap";

export async function loadSpecFromFile(specFilePath: string): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIWithSourcemap(path.resolve(specFilePath))
    return { success: true, flattened: results.jsonLike, sourcemap: results.sourcemap }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
export async function loadSpecFromUrl(specFileUrl: string): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIFromUrlWithSourcemap(specFileUrl)
    return { success: true, flattened: results.jsonLike, sourcemap: results.sourcemap }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

tap.test("can parse an OpenAPI spec with external references", async () => {
  const results = await loadSpecFromFile(
    path.join(__dirname, "../../inputs/openapi3-with-references/external-multiple.yaml")
  )
  tap.matchSnapshot(results);
});


tap.test("can parse an OpenAPI spec from url with external references", async () => {
  const results = await loadSpecFromUrl(
    `http://localhost:5000/openapi.yaml`
  )
  tap.matchSnapshot(results);
});
