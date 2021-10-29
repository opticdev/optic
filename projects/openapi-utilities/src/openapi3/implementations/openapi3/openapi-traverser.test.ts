import tap = require("tap");
import { jsonFromFile } from "../../pipeline/spec-from";
import { OpenAPITraverser } from "./openapi-traverser";


tap.test("can extract facts from specs", async () => {
  const traverser = new OpenAPITraverser();
  const spec = traverser.traverse(await jsonFromFile("./inputs/openapi3/petstore0.json")());
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

  console.log(traverser.accumulator.allFacts());
});
