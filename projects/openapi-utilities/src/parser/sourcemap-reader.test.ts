import { parseOpenAPIWithSourcemap } from "./openapi-sourcemap-parser";
import path from "path";
import { sourcemapReader } from "./sourcemap-reader";

it("can parse an OpenAPI spec with external references", async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        "../../inputs/openapi3-with-references/external-multiple.yaml"
      )
    )
  );

  const node = sourcemapReader(results.sourcemap).findPath(
    "#/properties/user/example/name"
  );

  null;
});
