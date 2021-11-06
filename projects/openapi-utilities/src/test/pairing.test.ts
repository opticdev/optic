import { OpenAPIV3 } from "openapi-types";
import { OpenAPITraverser } from "../openapi3/implementations/openapi3/openapi-traverser";
import { factsToChangelog } from "../openapi3/sdk/facts-to-changelog";

async function checkAdvancedSchemaUsage() {
  const fileContents: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
      title: "MyService",
      version: "3.0.0",
    },
    servers: [],
    components: {
      headers: {},
      parameters: {},
      responses: {},
      schemas: {},
    },
    paths: {},
  };

  const fileContentsWithChanges: OpenAPIV3.Document = {
    ...fileContents,
  };
  fileContentsWithChanges.paths = {
    "/example": {
      get: {
        responses: {
          "200": {
            description: "d",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    s: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  const fileContentsWithChanges2: OpenAPIV3.Document = {
    ...fileContents,
  };
  fileContentsWithChanges2.paths = {
    "/example": {
      get: {
        responses: {
          "200": {
            description: "d",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    s: {
                      type: "boolean",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  it("nested requires", async (done) => {
    const traverser = new OpenAPITraverser();
    traverser.traverse(fileContentsWithChanges);
    const facts = traverser.accumulator.allFacts();

    const traverser2 = new OpenAPITraverser();
    traverser2.traverse(fileContentsWithChanges2);
    const facts2 = traverser2.accumulator.allFacts();

    expect(facts).toMatchSnapshot();
    const changes = factsToChangelog(facts, facts2);

    expect(changes).toMatchSnapshot();
    done();
  });
}

async function main() {
  checkAdvancedSchemaUsage();
}

main();

/*
    Things to cover at some point
    - openapi version field
    - info block
    - servers block

    body should just have content type and schema root type
    schema children should have their own nodes


*/
