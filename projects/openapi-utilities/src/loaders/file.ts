import {SpecLoaderResult} from "./types";
import {parseOpenAPIWithSourcemap} from "../parser/openapi-sourcemap-parser";
import * as path from "path";
import tap from "tap";

export async function loadSpecFromFile(specFilePath: string): Promise<SpecLoaderResult> {
  try {
    const results = await parseOpenAPIWithSourcemap(path.resolve(specFilePath))
    return {success: true, flattened: results.jsonLike, sourcemap: results.sourcemap}
  } catch (e: any) {
    return {success: false, error: e.message}
  }
}

tap.test("can parse an OpenAPI spec with external references", async () => {
  const results = await loadSpecFromFile(
      path.join(__dirname, "../../inputs/openapi3-with-references/external-multiple.yaml")
  )
  tap.matchSnapshot(results);
});
