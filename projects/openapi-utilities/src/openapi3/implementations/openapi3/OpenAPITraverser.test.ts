import tap = require("tap");
import { jsonFromFile } from "../../pipeline/SpecFrom";
import { OpenAPITraverser } from "./OpenAPITraverser";

tap.test("can flatten specs", async () => {
  const traverser = new OpenAPITraverser();
  const spec = await traverser.prepare(await jsonFromFile("./inputs/openapi3/petstore0.json")());
  tap.matchSnapshot(spec);
});

tap.test("can extract facts from specs", async () => {
  const traverser = new OpenAPITraverser();
  const spec = await traverser.prepare(await jsonFromFile("./inputs/openapi3/petstore0.json")());
  traverser.traverse(spec);
  tap.matchSnapshot(traverser.accumulator.allFacts());
});

tap.test("can produce valid facts from json schema", async () => {
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
    [],
    []
  );

  tap.matchSnapshot(traverser.accumulator.allFacts());
});
