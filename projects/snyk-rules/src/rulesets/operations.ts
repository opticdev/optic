import { SnykApiCheckDsl } from "../dsl";
const expect = require("chai").expect;

export function operationsRules({ operations }: SnykApiCheckDsl) {
  console.log("mounting this");
  operations.requirement.must("have an operationId", (operation) => {
    expect(operation.operationId).to.be.ok;
  });
}
