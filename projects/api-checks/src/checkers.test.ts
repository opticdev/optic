import tap from "tap";
import { Checker } from "./checker";
const { assert } = require("chai"); // Using Assert style

tap.test(
  "checks can run / fail using off-the-shelf test helpers",
  async (t) => {
    const check = new Checker();
    await check.runCheck("location", "is a thing", true, () => {
      assert(false, "it's broken!!!");
    });
    await check.runCheck("location", "is a an ok thing", true, () => {
      assert(true, "it's broken if you see this");
    });

    tap.matchSnapshot(check.listResults());
  }
);
