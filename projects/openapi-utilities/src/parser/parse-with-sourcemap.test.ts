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

it("can parse a real schema spec with external references, resolved in any order", async () => {
  const results = await parseOpenAPIWithSourcemap(
    path.resolve(
      path.join(
        __dirname,
        "../../../snyk-rules/end-end-tests/api-standards/resources/thing/2021-11-10/001-ok-add-property-field.yaml"
      )
    )
  );

  const keys = Object.keys(results.sourcemap.mappings);

  const knownValid = [
    "/paths/~1thing~1{thing_id}/patch/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/attributes/properties/description",
    "/paths/~1thing~1{thing_id}/patch/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/attributes/properties/created",
    "/paths/~1thing~1{thing_id}/patch/responses/409/content/application~1vnd.api+json/schema/properties/jsonapi",
    "/paths/~1thing~1{thing_id}/patch/responses/400/content/application~1vnd.api+json/schema/properties/jsonapi",
    "/paths/~1thing/get/responses/404/content/application~1vnd.api+json/schema/properties/errors",
    "/paths/~1thing~1{thing_id}/delete/responses/401/content/application~1vnd.api+json/schema/properties/errors",
    "/paths/~1thing~1{thing_id}/delete/responses/403/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version",
    "/paths/~1thing~1{thing_id}/get/responses/400/headers/snyk-version-served",
    "/paths/~1thing~1{thing_id}/patch/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/id",
    "/paths/~1thing~1{thing_id}/delete/responses/401/content/application~1vnd.api+json/schema/properties/jsonapi",
    "/paths/~1thing/get/responses/500/content/application~1vnd.api+json/schema/properties/errors",
    "/paths/~1thing/post/responses/409/content/application~1vnd.api+json/schema/properties/jsonapi",
    "/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/errors/items/properties/status",
    "/paths/~1thing~1{thing_id}/get/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer",
    "/paths/~1thing/get/responses/200/content/application~1vnd.api+json/schema/properties/data/items/properties/attributes/properties/description",
    "/paths/~1thing~1{thing_id}/delete/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail",
    "/paths/~1thing~1{thing_id}/patch/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/parameter",
    "/paths/~1thing/get/responses/200/content/application~1vnd.api+json/schema/properties/data/items/properties/relationships",
    "/paths/~1thing~1{thing_id}/get/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/id",
    "/paths/~1thing~1{thing_id}/patch/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail",
    "/paths/~1thing~1{thing_id}/patch/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/source",
    "/paths/~1thing~1{thing_id}/delete/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/id",
    "/paths/~1thing~1{thing_id}/get/responses/403/headers/snyk-version-served",
    "/paths/~1thing/post/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/parameter",
    "/paths/~1thing/get/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer",
    "/paths/~1thing~1{thing_id}/get/responses/400/headers/snyk-request-id",
    "/paths/~1thing/post/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail",
    "/paths/~1thing~1{thing_id}/get/responses/500/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version",
    "/paths/~1thing~1{thing_id}/get/responses/500/content/application~1vnd.api+json/schema/properties/errors",
    "/paths/~1thing~1{thing_id}/delete/responses/400/content/application~1vnd.api+json/schema/properties/jsonapi",
    "/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/errors/items/properties/source",
    "/paths/~1thing/get/responses/200/content/application~1vnd.api+json/schema/properties/data/items/properties/relationships/properties/example",
    "/paths/~1thing~1{thing_id}/get/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/relationships/properties/example/properties/links/properties/related",
    "/paths/~1thing~1{thing_id}/delete/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/status",
    "/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version",
    "/paths/~1thing~1{thing_id}/delete/responses/500/headers/deprecation",
    "/paths/~1thing/get/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/id",
    "/paths/~1thing~1{thing_id}/patch/responses/403/headers/snyk-version-served",
    "/paths/~1thing~1{thing_id}/delete/responses/403/content/application~1vnd.api+json/schema/properties/errors/items/properties/meta",
    "/paths/~1thing~1{thing_id}/patch/responses/401/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer",
    "/paths/~1thing~1{thing_id}/delete/responses/500/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer",
    "/paths/~1thing~1{thing_id}/delete/responses/400/content/application~1vnd.api+json/schema/properties/errors/items/properties/id",
    "/paths/~1thing/get/responses/404/headers/deprecation",
    "/paths/~1thing~1{thing_id}/patch/responses/404/content/application~1vnd.api+json/schema/properties/errors/items/properties/detail",
    "/paths/~1thing/get/responses/400/headers/snyk-version-lifecycle-stage",
    "/paths/~1thing~1{thing_id}/get/responses/404/headers/snyk-request-id",
    "/paths/~1thing/post/responses/409/content/application~1vnd.api+json/schema/properties/errors/items/properties/source/properties/pointer",
    "/paths/~1thing~1{thing_id}/delete/responses/400/content/application~1vnd.api+json/schema/properties/errors/items/properties/id",
    "/paths/~1thing/post/responses/404/content/application~1vnd.api+json/schema/properties/errors",
    "/paths/~1thing~1{thing_id}/get/responses/401/content/application~1vnd.api+json/schema/properties/jsonapi/properties/version",
  ];

  console.log(keys.length);
  knownValid.forEach((i) => {
    console.log(i);
    expect(keys.includes(i)).toBeTruthy();
  });

  expect(prepSnapshot(results)).toMatchSnapshot();
});
