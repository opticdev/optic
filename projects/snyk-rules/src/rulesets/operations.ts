import { SnykApiCheckDsl } from "../dsl";
const expect = require("chai").expect;

export function operationsRules({ operations }: SnykApiCheckDsl) {
  operations.requirement.must("have an operationId", (operation) => {
    expect(operation.operationId).to.be.ok;
  });
}
