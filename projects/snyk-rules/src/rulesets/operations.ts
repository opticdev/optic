import { SnykApiCheckDsl } from "../dsl";
const expect = require("chai").expect;

export function operationsRules({ operations }: SnykApiCheckDsl) {
  operations.requirement.must("have the correct operationId format", (operation) => {
    expect(operation.operationId).to.be.ok;
    const camelCaseRe = /^(get|create|list|update|delete)([A-Z][a-z]+)+$/g;
    expect(camelCaseRe.test(operation.operationId || "")).to.be.ok;
  });
}
