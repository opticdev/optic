import { OpenAPITraverser } from "./openapi-traverser";
import fs from "fs-extra";

export type SpecFrom = () => Promise<any>;

export const jsonFromFile = (path: string) => async () => {
  const bytes = await fs.readJson(path);
  return bytes;
};

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
