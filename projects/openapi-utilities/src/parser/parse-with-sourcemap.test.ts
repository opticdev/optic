import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from "./openapi-sourcemap-parser";
import path from "path";

const cwd = process.cwd();

function prepSnapshot(result: ParseOpenAPIResult) {
  result.sourcemap.files.forEach((i) => {
    console.log(i.path);
    i.path = i.path.split(cwd)[1];
  });
  return result;
}

it("can parse an OpenAPI spec with external references", async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        "../../inputs/openapi3-with-references/external-multiple.yaml"
      )
    )
  );

  expect(prepSnapshot(results)).toMatchSnapshot();
});
