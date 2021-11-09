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
};
