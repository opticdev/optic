import { SnykApiCheckDsl } from "../dsl";
const chai = require("chai");
const { expect } = chai;
// @ts-ignore
chai.use(function (_chai, _) {
  // @ts-ignore
  _chai.Assertion.addMethod("withMessage", function (msg) {
    // @ts-ignore
    _.flag(this, "message", msg);
  });
});

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
      expect(operation.tags).withMessage(
        "tags [] must be set on each operation"
      ).to.exist;
      expect(operation.tags)
        .withMessage("tags [] must have at least one tag")
        .to.have.lengthOf.above(0);
    });
  },
  summary: ({ operations }: SnykApiCheckDsl) => {
    operations.requirement.must("have a summary", (operation) => {
      expect(operation.summary).to.exist;
    });
  },
};
