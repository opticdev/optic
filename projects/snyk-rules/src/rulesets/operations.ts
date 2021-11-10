import { SnykApiCheckDsl } from "../dsl";
const { expect } = require("chai");

export const rules = {
  operationId: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "have the correct operationId format",
      (operation) => {
        expect(operation.operationId).to.be.ok;
        const camelCaseRe = /^(get|create|list|update|delete)([A-Z][a-z]+)+$/g;
        expect(
          camelCaseRe.test(operation.operationId || ""),
          `operationId "${
            operation.operationId || ""
          }" must be formatted [get|create|list|update|delete]camelCaseResource`
        ).to.be.ok;
      }
    );
  },
  tags: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must("have tags", (operation) => {
      expect(operation.tags).to.exist;
      expect(operation.tags).to.have.lengthOf.above(0, "with examples");
    });
  },
  summary: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must("have a summary", (operation) => {
      expect(operation.summary).to.exist;
    });
  },
  removingOperationId: ({ operations }: SnykApiCheckDsl) => {
    operations.changed.must(
      "have consistent operation IDs",
      (current, next) => {
        expect(current.operationId).to.equal(next.operationId);
      }
    );
  },
  parameterCase: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "use the correct case",
      (operation, context, docs, specItem) => {
        const snakeCase = /^[a-z]+(?:_[a-z]+)*$/g;
        for (const parameter of specItem.parameters || []) {
          if ("in" in parameter && ["path", "query"].includes(parameter.in)) {
            expect(
              snakeCase.test(parameter.name),
              `expected parameter name ${parameter.name} to be snake case`
            ).to.be.ok;
          }
        }
      }
    );
  },
  versionParameter: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "include a version parameter",
      (operation, context, docs, specItem) => {
        const parameterNames = (specItem.parameters || [])
          .filter((parameter) => "in" in parameter && parameter.in === "query")
          .map((parameter) => {
            if ("name" in parameter) return parameter.name;
          });
        expect(parameterNames).to.include("version");
      }
    );
  },
  preventAddingRequiredQueryParameters: ({ request }: SnykApiCheckDsl) => {
    request.queryParameter.added.must("not be required", (queryParameter) => {
      expect(queryParameter.required).to.not.be.true;
    });
  },
  preventChangingOptionalToRequiredQueryParameters: ({
    request,
  }: SnykApiCheckDsl) => {
    request.queryParameter.changed.must(
      "not be optional then required",
      (queryParameterBefore, queryParameterAfter) => {
        if (!queryParameterBefore.required) {
          expect(queryParameterAfter.required).to.not.be.true;
        }
      }
    );
  },
  preventRemovingStatusCodes: ({ responses }: SnykApiCheckDsl) => {
    responses.removed.must("not be removed", (response) => {
      expect(false, `expected ${response.statusCode} to be present`).to.be.true;
    });
  },
  preventChangingParameterDefaultValue: ({ request }: SnykApiCheckDsl) => {
    request.queryParameter.changed.must(
      "not change the default value",
      (parameterBefore, parameterAfter) => {
        let beforeSchema = parameterBefore.schema || {};
        let afterSchema = parameterAfter.schema || {};
        if ("default" in beforeSchema && "default" in afterSchema) {
          expect(beforeSchema.default).to.equal(afterSchema.default);
        }
      }
    );
  },
};
