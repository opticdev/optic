import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from "./openapi-sourcemap-parser";
import path from "path";
import sortBy from "lodash.sortby";

const cwd = process.cwd();

// asts are circular and very expensive to snapshot / not useful to make our own rep that's smaller
function prepSnapshot(result: ParseOpenAPIResult) {
  result.sourcemap.files.forEach((i) => {
    i.path = i.path.split(cwd)[1];

    // @ts-ignore
    i.ast = null;
  });

  result.sourcemap.files = sortBy(result.sourcemap.files, "index");

  const mini = {};

  Object.entries(result.sourcemap.mappings).map(([key, value]) => {
    // @ts-ignore
    mini[key] = [null, value[1], value[2]];
  });

  result.sourcemap.mappings = mini;

  return result;
}

it("can parse a json schema spec with external references", async () => {
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
it("can parse an OpenAPI file and have valid sourcemap", async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(path.join(__dirname, "../../inputs/openapi3/petstore0.json"))
  );

  expect(prepSnapshot(results)).toMatchSnapshot();
});
