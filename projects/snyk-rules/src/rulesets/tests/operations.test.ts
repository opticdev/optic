import tap from "tap";
import { rulesFixture } from "./fixtures";
import { operationsRules } from "../operations";

tap.test("op-001 - operations must have operation ids", async () => {
  const {
    op001_before,
    op001_with_path_and_no_op_id,
    op001_with_path_and_valid_op_id,
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
      op001_with_path_and_valid_op_id,
      {},
      operationsRules
    ),
    "valid id should pass"
  );
});
