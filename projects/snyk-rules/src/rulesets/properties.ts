import { SnykApiCheckDsl } from "../dsl";
const chai = require("chai");
const { expect } = chai;
// todo: fix copy/paste
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
    bodyProperties.requirement.must("have camel case keys", ({ key }) => {
      const camelCaseRe = /^[a-z]+([A-Z][a-z]+)+$/g;
      expect(camelCaseRe.test(key)).to.be.ok;
    });
  },
  propertyExample: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.must("have an example", ({ flatSchema }) => {
      expect(flatSchema.example).to.exist;
    });
  },
  propertyFormat: ({ bodyProperties }: SnykApiCheckDsl) => {
    bodyProperties.requirement.should(
      "have a format when a string",
      ({ flatSchema }) => {
        if (flatSchema.type === "string") {
          expect(flatSchema.format).to.exist;
        }
      }
    );
  },
};
