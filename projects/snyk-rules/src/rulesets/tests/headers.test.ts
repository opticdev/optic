import { rules } from "../headers";
import { createTestDslFixture } from "@useoptic/api-checks";
import { SnykApiCheckDsl, SynkApiCheckContext } from "../../dsl";

// todo: fix copy/paste
const { compare } = createTestDslFixture<SnykApiCheckDsl, SynkApiCheckContext>(
  (input) => {
    return new SnykApiCheckDsl(
      input.nextFacts,
      input.changelog,
      input.nextJsonLike,
      input.context
    );
  }
);

// todo: fix copy/paste
const emptyContext: SynkApiCheckContext = {
  changeDate: "2021-10-10",
  changeResource: "Example",
  changeVersion: {
    date: "2021-10-10",
    stability: "ga",
  },
  resourceVersions: {},
};

describe("headers", () => {
  // todo: fix copy/paste
  const baseOpenAPI = {
    openapi: "3.0.1",
    paths: {
      "/example": {
        get: {
          responses: {},
        },
      },
    },
    info: { version: "0.0.0", title: "Empty" },
  };

  describe("name", () => {
    it("passes if kebab case", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              headers: {
                "good-header": {
                  schema: { type: "string" },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.headerNameCase, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });

    it("fails if not kebab case", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              headers: {
                badHeader: {
                  schema: { type: "string" },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.headerNameCase, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });
});
