import tap from 'tap'
import {parseOpenAPIWithSourcemap} from "./openapi-sourcemap-parser";
import path from "path";

tap.test("can parse an OpenAPI spec with external references", async () => {

  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(__dirname, "../../inputs/openapi3-with-references/external-multiple.yaml")
    )
  );

  tap.matchSnapshot(results);

});
