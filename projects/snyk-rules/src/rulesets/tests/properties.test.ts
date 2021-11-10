import { rules } from "../properties";
import { SnykApiCheckDsl, SynkApiCheckContext } from "../../dsl";

import { createSnykTestFixture } from "./fixtures";

const { compare } = createSnykTestFixture();
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
    it("passes when snake case", async () => {
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
                      is_snake_case: { type: "string" },
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

    it("fails when not snake case", async () => {
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
                      "not-snake-case": { type: "string" },
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

  describe("breaking changes", () => {
    it("fails if a property is removed", async () => {
      const base = JSON.parse(JSON.stringify(baseOpenAPI));
      base.paths!["/example"]!.get!.responses = {
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
      const result = await compare(base)
        .to((spec) => {
          spec.paths!["/example"]!.get!.responses = {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {},
                  },
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.preventRemoval, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
    it("fails if a required property is added", async () => {
      const base = JSON.parse(JSON.stringify(baseOpenAPI));
      base.paths!["/example"]!.get!.requestBody = {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {},
            },
          },
        },
      };
      const result = await compare(base)
        .to((spec) => {
          spec.paths!["/example"]!.get!.requestBody = {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "number" },
                  },
                  required: ["count"],
                },
              },
            },
          };
          return spec;
        })
        .withRule(rules.preventAddingRequiredRequestProperties, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });
});
