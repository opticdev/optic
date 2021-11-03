import tap from "tap";
import { rulesFixture } from "./fixtures";
import { rules } from "../operations";
import { createDslFixture } from "./test-rule-fixture";
import { SnykApiCheckDsl, SynkApiCheckContext } from "../../dsl";
import { op001_before } from "./inputs/operationIds";

const { compare } = createDslFixture<SnykApiCheckDsl, SynkApiCheckContext>(
  (input) => {
    return new SnykApiCheckDsl(input.nextFacts, input.changelog, input.context);
  }
);

const baseForTests = {
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

tap.test("op-001 - empty strings for operationId are invalid", async () => {
  const result = await compare(baseForTests)
    .to((spec) => {
      spec.paths!["/example"]!.get!.operationId = "";
      return spec;
    })
    .withRule(rules.operationId, {});

  console.log(result);
  tap.matchSnapshot(result);
});

tap.test("op-001 - operations must have operation ids", async () => {
  const {
    op001_before,
    op001_with_path_and_no_op_id,
    op001_with_path_and_valid_prefix,
    op001_with_path_and_invalid_case,
    op001_with_path_and_invalid_prefix,
    op001_with_tags_and_summary,
    op001_without_tags_and_summary,
  } = require("./inputs/operationIds");

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_no_op_id,
      {},
      rules.operationId
    ),
    "missing id should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_invalid_prefix,
      {},
      rules.operationId
    ),
    "invalid operation ID prefix should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_invalid_case,
      {},
      rules.operationId
    ),
    "invalid operation ID case should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_valid_prefix,
      {},
      rules.operationId
    ),
    "valid operation ID prefix should pass"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_tags_and_summary,
      {},
      rules.tags
    ),
    "with tags should pass"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_without_tags_and_summary,
      {},
      rules.tags
    ),
    "without tags should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_tags_and_summary,
      {},
      rules.summary
    ),
    "with summary should pass"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_without_tags_and_summary,
      {},
      rules.summary
    ),
    "without summary should fail"
  );
});
