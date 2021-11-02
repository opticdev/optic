import { SnykApiCheckDsl } from "../dsl";
const expect = require("chai").expect;

export function operationsRules({ operations }: SnykApiCheckDsl) {
  console.log("mounting this");
  operations.requirement.must("have an operationId", (operation) => {
    expect(operation.operationId).to.be.ok;
  });
  operations.requirement.must("have a correct operationId prefix", (operation) => {
    const validPrefixes = ["get", "create", "list", "update", "delete"];
    expect(
      validPrefixes.some((prefix) => operation.operationId?.startsWith(prefix))
    ).to.be.ok;
  });
  operations.requirement.must("have camel case operationId prefix", (operation) => {
    const camelCaseRe = /^[a-z]+([A-Z][a-z]+)*$/g;
    expect(camelCaseRe.test(operation.operationId || "")).to.be.ok;
  });
}
