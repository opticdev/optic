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

it("can produce valid facts from json schema", async () => {
  const traverser = new OpenAPITraverser();
  traverser.traverseSchema(
    {
      type: "object",
      properties: {
        id: {
          type: "integer",
          format: "int64",
        },
        petId: {
          type: "integer",
          format: "int64",
        },
        quantity: {
          type: "integer",
          format: "int32",
        },
        shipDate: {
          type: "string",
          format: "date-time",
        },
        status: {
          type: "string",
          description: "Order Status",
          enum: ["placed", "approved", "delivered"],
        },
        complete: {
          type: "boolean",
          default: false,
        },
      },
      xml: {
        name: "Order",
      },
    },
    "",
    [],
    { path: "", method: "get", inResponse: { statusCode: "200" } }
  );

  expect(traverser.accumulator.allFacts()).toMatchSnapshot();
});
