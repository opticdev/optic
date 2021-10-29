import tap from "tap";
import { ApiCheckService } from "../api-check-service";
import { SnykApiDSL, SnykContext } from "./dsl";
import { OpenAPIV3 } from "@useoptic/openapi-utilities";
const expect = require("chai").expect;

export const defaultEmptySpec: OpenAPIV3.Document = {
  openapi: "3.0.1",
  paths: {},
  info: { version: "0.0.0", title: "Empty" },
};

tap.test("can run dsl rules through check service", async () => {
  const checker = new ApiCheckService<SnykContext>();

  function completenessApiRules(dsl: SnykApiDSL) {
    dsl.operations.changed.must(
      "have consistent operationIds",
      ({ current, next }) => {
        expect(current.operationId).equal(next.operationId);
      }
    );
  }

  checker.useDsl(
    (input) => new SnykApiDSL(input.nextFacts, input.changelog),
    completenessApiRules
  );

  const results = await checker.runRules(
    {
      ...defaultEmptySpec,
      paths: {
        "/example": {
          get: {
            operationId: "getExample",
            responses: {},
          },
        },
      },
    },
    {
      ...defaultEmptySpec,
      paths: {
        "/example": {
          get: {
            operationId: "get_example",
            responses: {},
          },
        },
      },
    },

    { maturity: "wip" }
  );

  tap.matchSnapshot(results);
});

const baseOpenAPI = defaultEmptySpec;
