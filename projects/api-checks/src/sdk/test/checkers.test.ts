import { Checker } from "../checker";
const { assert } = require("chai"); // Using Assert style

it("checks can run / fail using off-the-shelf test helpers", async (done) => {
  const check = new Checker();
  await check.runCheck("location", "is a thing", true, () => {
    assert(false, "it's broken!!!");
  });
  await check.runCheck("location", "is a an ok thing", true, () => {
    assert(true, "it's broken if you see this");
  });

  expect(check.listResults()).toMatchSnapshot();
  done();
});
