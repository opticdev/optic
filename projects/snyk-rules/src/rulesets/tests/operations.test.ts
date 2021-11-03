import { rules } from "../operations";
import { createDslFixture } from "./test-rule-fixture";
import { SnykApiCheckDsl, SynkApiCheckContext } from "../../dsl";

const { compare } = createDslFixture<SnykApiCheckDsl, SynkApiCheckContext>(
  (input) => {
    return new SnykApiCheckDsl(input.nextFacts, input.changelog, input.context);
  }
);

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

it("empty string operationId is invalid", async () => {
  const result = await compare(baseForOperationIdTests)
    .to((spec) => {
      spec.paths!["/example"]!.get!.operationId = "";
      return spec;
    })
    .withRule(rules.operationId, {});

  expect(result.results[0].passed).toBeFalsy();
  expect(result).toMatchSnapshot();
});

it("undefined operationId is invalid", async () => {
  const result = await compare(baseForOperationIdTests)
    .to((spec) => {
      delete spec.paths!["/example"]!.get!.operationId;
      return spec;
    })
    .withRule(rules.operationId, {});

  expect(result.results[0].passed).toBeFalsy();
  expect(result).toMatchSnapshot();
});

it("invalid operationId prefix should fail", async () => {
  const result = await compare(baseForOperationIdTests)
    .to((spec) => {
      spec.paths!["/example"]!.get!.operationId = "findHelloWorld";
      return spec;
    })
    .withRule(rules.operationId, {});

  expect(result.results[0].passed).toBeFalsy();
  expect(result).toMatchSnapshot();
});

it("invalid operationId case should fail", async () => {
  const result = await compare(baseForOperationIdTests)
    .to((spec) => {
      spec.paths!["/example"]!.get!.operationId = "get-hello-world";
      return spec;
    })
    .withRule(rules.operationId, {});

  expect(result.results[0].passed).toBeFalsy();
  expect(result).toMatchSnapshot();
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

it("missing summary should fail", async () => {
  const result = await compare(baseForOperationMetadataTests)
    .to((spec) => {
      delete spec.paths!["/example"]!.get!.summary;
      return spec;
    })
    .withRule(rules.summary, {});

  expect(result.results[0].passed).toBeFalsy();
  expect(result).toMatchSnapshot();
});

it("with summary passes", async () => {
  const result = await compare(baseForOperationMetadataTests)
    .to((spec) => {
      spec.paths!["/example"]!.get!.summary = "I have a summary";
      return spec;
    })
    .withRule(rules.summary, {});

  expect(result.results[0].passed).toBeTruthy();
  expect(result).toMatchSnapshot();
});

it("with tags passes", async () => {
  const result = await compare(baseForOperationMetadataTests)
    .to((spec) => spec)
    .withRule(rules.tags, {});

  expect(result.results[0].passed).toBeTruthy();
  expect(result).toMatchSnapshot();
});

it("missing tags should fail", async () => {
  const result = await compare(baseForOperationMetadataTests)
    .to((spec) => {
      delete spec.paths!["/example"]!.get!.tags;
      return spec;
    })
    .withRule(rules.tags, {});

  expect(result.results[0].passed).toBeFalsy();
  expect(result).toMatchSnapshot();
});
