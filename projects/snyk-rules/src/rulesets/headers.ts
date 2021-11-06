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
  headerNameCase: ({ responses }: SnykApiCheckDsl) => {
    responses.headers.requirement.must("be kebab case", ({ name }) => {
      const kebabCase = /^[a-z]+(-[a-z]+)+$/g;
      expect(kebabCase.test(name)).to.be.true;
    });
  },
};
