import { SnykApiCheckDsl } from "../dsl";
import { camelCase, snakeCase } from "change-case";
import { OpenAPIV3 } from "@useoptic/api-checks";

const { expect } = require("chai");

const prefixRegex = /^(get|create|list|update|delete)[A-Z]+.*/; // alternatively we could split at camelCase boundaries and assert on the first item

export const rules = {
  operationId: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "have the correct operationId format",
      (operation) => {
        expect(operation.operationId).to.be.ok;
        if (operation.operationId !== undefined) {
          const normalized = camelCase(operation.operationId);
          expect(
            normalized === operation.operationId &&
              prefixRegex.test(operation.operationId),
            `operationId "${operation.operationId}" must be camelCase (${normalized}) and start with get|create|list|update|delete`
          ).to.be.ok;
        }
      }
    );
  },
  tags: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must("have tags", (operation) => {
      expect(operation.tags).to.exist;
      expect(operation.tags).to.have.lengthOf.above(0, "with examples");
      for (const tag of operation.tags || []) {
        expect(tag).to.have.property("name");
        expect(tag).to.have.property("description");
      }
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
        for (const p of specItem.parameters || []) {
          const parameter = p as OpenAPIV3.ParameterObject;
          if (["path", "query"].includes(parameter.in)) {
            const normalized = snakeCase(parameter.name);

            expect(
              normalized === parameter.name,
              `expected parameter name "${parameter.name}" to be snake_case (${normalized})`
            ).to.be.ok;
          }
        }
      }
    );
  },
  preventRemovingOperation: ({ operations }: SnykApiCheckDsl) => {
    operations.removed.must("not be allowed", (operation, context) => {
      expect.fail("expected operation to be present");
    });
  },
  versionParameter: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "include a version parameter",
      (operation, context, docs, specItem) => {
        const parameters = (specItem.parameters ||
          []) as OpenAPIV3.ParameterObject[];
        const parameterNames = parameters
          .filter((parameter) => parameter.in === "query")
          .map((parameter) => {
            return parameter.name;
          });
        expect(parameterNames).to.include("version");
      }
    );
  },
  tenantFormatting: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must(
      "use UUID for org_id or group_id",
      (operation, context, docs, specItem) => {
        for (const parameter of specItem.parameters || []) {
          if ("$ref" in parameter) continue;
          if (parameter.name === "group_id" || parameter.name === "org_id") {
            if (!parameter.schema) {
              expect.fail(
                `expected operation ${operation.pathPattern} ${operation.method} parameter ${parameter.name} to have a schema`
              );
              continue;
            }
            if (!("$ref" in parameter.schema)) {
              expect(
                parameter.schema.format,
                `expected operation ${operation.pathPattern} ${operation.method} parameter ${parameter.name} to have a schema`
              ).to.be("uuid");
            }
          }
        }
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
        let beforeSchema = (parameterBefore.schema ||
          {}) as OpenAPIV3.SchemaObject;
        let afterSchema = (parameterAfter.schema ||
          {}) as OpenAPIV3.SchemaObject;
        expect(beforeSchema.default).to.equal(afterSchema.default);
      }
    );
  },
};
