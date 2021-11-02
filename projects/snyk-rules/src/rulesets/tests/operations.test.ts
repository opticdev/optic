import tap from "tap";
import { rulesFixture } from "./fixtures";
import { operationsRules } from "../operations";
// import { op001_with_path_and_valid_prefix, op001_with_path_and_invalid_case, op001_with_path_and_invalid_prefix } from "./inputs/operationIds";

tap.test("op-001 - operations must have operation ids", async () => {
  const {
    op001_before,
    op001_with_path_and_no_op_id,
    op001_with_path_and_valid_prefix,
    op001_with_path_and_invalid_case,
    op001_with_path_and_invalid_prefix,
  } = require("./inputs/operationIds");

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_no_op_id,
      {},
      operationsRules
    ),
    "missing id should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_invalid_prefix,
      {},
      operationsRules
    ),
    "invalid operation ID prefix should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_invalid_case,
      {},
      operationsRules
    ),
    "invalid operation ID case should fail"
  );

  tap.matchSnapshot(
    await rulesFixture(
      op001_before,
      op001_with_path_and_valid_prefix,
      {},
      operationsRules
    ),
    "valid operation ID prefix should pass"
  );
});
