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
  propertyKey: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must("be camel case", ({ key }) => {
      const camelCaseRe = /^[a-z]+([A-Z][a-z]+)+$/g;
      expect(camelCaseRe.test(key)).to.be.ok;
    });
  },
  propertyExample: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must("be camel case", ({ flatSchema }) => {
      expect(flatSchema.example).to.exist;
    });
  },
};
