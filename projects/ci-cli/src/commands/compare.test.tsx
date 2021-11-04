// import { render } from "ink-testing-library";
// import React from "react";
// import { Compare } from "./compare";
// import { parseSpecVersion } from "../input-helpers/compare-input-parser";
// import { defaultEmptySpec } from "../constants";
// import * as path from "path";
// import tap from "tap";
//
// const inputs = path.resolve(
//   __dirname,
//   "../../openapi-optic/poc-governance-tools/projects/openapi-utilities/inputs"
// );
//
// tap.test("renders a failure to find specs properly", async () => {
//   const compareCommand = (
//     <Compare
//       from={parseSpecVersion(
//         path.join(inputs, "openapi3", "petstore0.json"),
//         defaultEmptySpec
//       )}
//       to={parseSpecVersion(
//         path.join(inputs, "openapi3", "petstore0.json-not-real"),
//         defaultEmptySpec
//       )}
//       rules={"path-to-rules"}
//     />
//   );
//
//   const { lastFrame, frames } = render(compareCommand);
//
//   await new Promise((resolve) => {
//     setTimeout(resolve, 4000);
//   });
//
//   tap.matchSnapshot(frames);
// });
