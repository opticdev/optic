import { SnykApiCheckDsl } from "../dsl";
const { expect } = require("chai");

export const rules = {
  headerNameCase: ({ responses }: SnykApiCheckDsl) => {
    responses.headers.requirement.must("be kebab case", ({ name }) => {
      const kebabCase = /^[a-z]+(-[a-z]+)+$/g;
      expect(kebabCase.test(name)).to.be.true;
    });
  },
  responseHeaders: ({ responses }: SnykApiCheckDsl) => {
    responses.requirement.must(
      "have all headers",
      (response, context, docs, specItem) => {
        const requiredHeaders = [
          "snyk-request-id",
          "deprecation",
          "snyk-version-lifecycle-stage",
          "snyk-version-requested",
          "snyk-version-served",
          "sunset",
        ];
        const specHeaders = Object.keys(specItem.headers || {});

        // Note: this allows for including headers that aren't required
        for (const requiredHeader of requiredHeaders) {
          expect(specHeaders).to.include(requiredHeader);
        }
      }
    );
  },
};
