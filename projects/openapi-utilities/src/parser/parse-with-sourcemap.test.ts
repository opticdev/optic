import {
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from "./openapi-sourcemap-parser";
import path from "path";
import sortBy from "lodash.sortby";

const cwd = process.cwd();

function prepSnapshot(result: ParseOpenAPIResult) {
  result.sourcemap.files.forEach((i) => {
    i.path = i.path.split(cwd)[1];
    // @ts-ignore
    i.ast = null;
  });

  result.sourcemap.rootFilePath = result.sourcemap.rootFilePath.split(cwd)[1];

  result.sourcemap.files = sortBy(result.sourcemap.files, "index");

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

it("can parse a json schema spec with external references to the same file", async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        "../../inputs/openapi3-with-references/external-multiple-branches.yaml"
      )
    )
  );
  expect(prepSnapshot(results)).toMatchSnapshot();

  // expect(results.sourcemap.mappings).toHaveProperty("/example/user2/name");
  // expect(prepSnapshot(results)).toMatchSnapshot();
});

it("can parse an OpenAPI file and have valid sourcemap", async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(path.join(__dirname, "../../inputs/openapi3/petstore0.json"))
  );
  expect(prepSnapshot(results)).toMatchSnapshot();
});
//
// it("can parse a real schema spec with external references, resolved in any order", async () => {
//   const results = await parseOpenAPIWithSourcemap(
//     path.resolve(
//       path.join(
//         __dirname,
//         "../../../snyk-rules/end-end-tests/api-standards/resources/thing/2021-11-10/001-ok-add-property-field.yaml"
//       )
//     )
//   );
//
//   expect(prepSnapshot(results)).toMatchSnapshot();
// });
