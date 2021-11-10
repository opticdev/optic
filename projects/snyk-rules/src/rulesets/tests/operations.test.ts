import { rules } from "../operations";
import { SnykApiCheckDsl, SynkApiCheckContext } from "../../dsl";

import { createSnykTestFixture } from "./fixtures";
const { compare } = createSnykTestFixture();

const emptyContext: SynkApiCheckContext = {
  changeDate: "2021-10-10",
  changeResource: "Example",
  changeVersion: {
    date: "2021-10-10",
    stability: "ga",
  },
  resourceVersions: {},
};

describe("operationId", () => {
  const baseForOperationIdTests = {
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

  describe("missing", () => {
    it("fails if empty string", async () => {
      const result = await compare(baseForOperationIdTests)
        .to((spec) => {
          spec.paths!["/example"]!.get!.operationId = "";
          return spec;
        })
        .withRule(rules.operationId, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("fails if undefined", async () => {
      const result = await compare(baseForOperationIdTests)
        .to((spec) => {
          delete spec.paths!["/example"]!.get!.operationId;
          return spec;
        })
        .withRule(rules.operationId, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });

  describe("when set", () => {
    it("fails if prefix is wrong", async () => {
      const result = await compare(baseForOperationIdTests)
        .to((spec) => {
          spec.paths!["/example"]!.get!.operationId = "findHelloWorld";
          return spec;
        })
        .withRule(rules.operationId, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("fails if not camel case", async () => {
      const result = await compare(baseForOperationIdTests)
        .to((spec) => {
          spec.paths!["/example"]!.get!.operationId = "get-hello-world";
          return spec;
        })
        .withRule(rules.operationId, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });

  it("fails if removed", async () => {
    const baseCopy = JSON.parse(JSON.stringify(baseForOperationIdTests));
    baseCopy.paths["/example"].get.operationId = "example";
    const result = await compare(baseCopy)
      .to((spec) => {
        delete spec.paths!["/example"]!.get!.operationId;
        return spec;
      })
      .withRule(rules.removingOperationId, emptyContext);

    expect(result.results[0].passed).toBeFalsy();
    expect(result).toMatchSnapshot();
  });

  it("fails if changed", async () => {
    // todo: fix copy/paste
    const baseCopy = JSON.parse(JSON.stringify(baseForOperationIdTests));
    baseCopy.paths["/example"].get.operationId = "example";
    const result = await compare(baseCopy)
      .to((spec) => {
        spec.paths!["/example"]!.get!.operationId = "example2";
        return spec;
      })
      .withRule(rules.removingOperationId, emptyContext);

    expect(result.results[0].passed).toBeFalsy();
    expect(result).toMatchSnapshot();
  });
});

const baseForOperationMetadataTests = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: {
        tags: ["Example"],
        operationId: "getExample",
        summary: "Retrieve example",
        responses: {},
      },
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};

describe("operation metadata", () => {
  describe("summary", () => {
    it("fails if missing", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          delete spec.paths!["/example"]!.get!.summary;
          return spec;
        })
        .withRule(rules.summary, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("passes if provided", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          spec.paths!["/example"]!.get!.summary = "I have a summary";
          return spec;
        })
        .withRule(rules.summary, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });
  });

  describe("tags", () => {
    it("passes if > 1 tag provided", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => spec)
        .withRule(rules.tags, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });

    it("fail is not provided", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          delete spec.paths!["/example"]!.get!.tags;
          return spec;
        })
        .withRule(rules.tags, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });
});

describe("operation parameters", () => {
  describe("names", () => {
    it("fails if the case isn't correct", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          delete spec.paths!["/example"];
          spec.paths!["/example/{pathParameter}"] = {
            get: {
              parameters: [
                {
                  in: "path",
                  name: "pathParameter",
                },
              ],
              responses: {},
            },
          };
          return spec;
        })
        .withRule(rules.parameterCase, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("passes if the case is correct", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          delete spec.paths!["/example"];
          spec.paths!["/example/{path_parameter}"] = {
            get: {
              parameters: [
                {
                  in: "path",
                  name: "path_parameter",
                },
              ],
              responses: {},
            },
          };
          return spec;
        })
        .withRule(rules.parameterCase, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });

    it("fails when adding a required query parameter", async () => {
      // const base = JSON.parse(JSON.stringify(baseForOperationMetadataTests));
      // base.paths!["/example"]!.get!.parameters = [];
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          spec.paths!["/example"]!.get!.parameters = [
            {
              in: "query",
              name: "query_parameter",
              required: true,
            },
          ];
          return spec;
        })
        .withRule(rules.preventAddingRequiredQueryParameters, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("fails when changing optional to required query parameter", async () => {
      const base = JSON.parse(JSON.stringify(baseForOperationMetadataTests));
      base.paths!["/example"]!.get!.parameters = [
        {
          in: "query",
          name: "query_parameter",
        },
      ];
      const result = await compare(base)
        .to((spec) => {
          spec.paths!["/example"]!.get!.parameters = [
            {
              in: "query",
              name: "query_parameter",
              required: true,
            },
          ];
          return spec;
        })
        .withRule(
          rules.preventChangingOptionalToRequiredQueryParameters,
          emptyContext
        );

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("fails if the default value is changed", async () => {
      const base = JSON.parse(JSON.stringify(baseForOperationMetadataTests));
      base.paths!["/example"]!.get!.parameters = [
        {
          in: "query",
          name: "query_parameter",
          schema: {
            type: "string",
            default: "before",
          },
        },
      ];
      const result = await compare(base)
        .to((spec) => {
          spec.paths!["/example"]!.get!.parameters = [
            {
              in: "query",
              name: "query_parameter",
              schema: {
                type: "string",
                default: "after",
              },
            },
          ];
          return spec;
        })
        .withRule(rules.preventChangingParameterDefaultValue, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });

  describe("status codes", () => {
    it("fails when a status codes is removed", async () => {
      const base = JSON.parse(JSON.stringify(baseForOperationMetadataTests));
      base.paths["/example"].get.responses = {
        "200": {
          description: "Example response",
        },
      };
      const result = await compare(base)
        .to((spec) => {
          delete spec.paths!["/example"]!.get!.responses!["200"];
          return spec;
        })
        .withRule(rules.preventRemovingStatusCodes, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });
  });

  describe("version parameter", () => {
    it("fails when there is no version parameter", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => spec)
        .withRule(rules.versionParameter, emptyContext);

      expect(result.results[0].passed).toBeFalsy();
      expect(result).toMatchSnapshot();
    });

    it("passes if there is a version parameter", async () => {
      const result = await compare(baseForOperationMetadataTests)
        .to((spec) => {
          spec.paths!["/example"]!.get!.parameters = [
            {
              in: "query",
              name: "version",
            },
          ];
          return spec;
        })
        .withRule(rules.parameterCase, emptyContext);

      expect(result.results[0].passed).toBeTruthy();
      expect(result).toMatchSnapshot();
    });
  });
});
