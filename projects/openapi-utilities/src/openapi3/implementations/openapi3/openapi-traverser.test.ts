import { jsonFromFile } from "../../pipeline/spec-from";
import { OpenAPITraverser } from "./openapi-traverser";

it("can flatten specs", async () => {
  const spec = await jsonFromFile("./inputs/openapi3/petstore0.json")();
  expect(spec).toMatchSnapshot();
});

it("can extract facts from specs", async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile("./inputs/openapi3/petstore0.json")();
  traverser.traverse(spec);
  expect(traverser.accumulator.allFacts()).toMatchSnapshot();
});
