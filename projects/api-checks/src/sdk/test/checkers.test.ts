import { Checker } from "../checker";
import { IChange } from "@useoptic/openapi-utilities";
const { assert } = require("chai"); // Using Assert style

const change: IChange<any> = {
  location: {
    kind: "simulated",
    jsonPath: [],
    conceptualPath: [],
    conceptualLocation: {
      path: "/simulated",
      method: "get",
    },
  },
};

it("checks can run / fail using off-the-shelf test helpers", async (done) => {
  const check = new Checker();
  await check.runCheck(change, "location", "is a thing", true, () => {
    assert(false, "it's broken!!!");
  });
  await check.runCheck(change, "location", "is a an ok thing", true, () => {
    assert(true, "it's broken if you see this");
  });

  expect(check.listResults()).toMatchSnapshot();
  done();
});
