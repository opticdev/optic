import { rules } from "../properties";
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

describe("body properties", () => {
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

  describe("key", () => {
    it("passes when camel case", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      isCamelCase: { type: "string" },
                    },
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.propertyKey, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });

    it("fails when not camel case", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      "not-camel-case": { type: "string" },
                    },
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.propertyKey, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });

  describe("example", () => {
    it("passes if exists", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string", example: "Jane Doe" },
                    },
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.propertyExample, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });

    it("fails if doesn't exist", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                    },
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.propertyExample, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });

  describe("format", () => {
    it("fails if format doesn't exist", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                    },
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.propertyFormat, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result.results[0].isShould).toBeTruthy();
      expect(result).toMatchSnapshot();
    });

    it("passes if not a string", async () => {
      const result = await compare(baseOpenAPI)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      count: { type: "number" },
                    },
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.propertyFormat, emptyContext);

      expect(result.results[0].isShould).toBeTruthy();
      expect(result).toMatchSnapshot();
    });
  });
});
