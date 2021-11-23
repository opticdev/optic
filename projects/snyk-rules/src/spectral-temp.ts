import { SpectralDsl } from "@useoptic/api-checks";
import ruleset from "./rulesets/spectral/ruleset";
import { Spectral } from "@stoplight/spectral-core";
import * as fs from "fs";
import YAML from "js-yaml";

export const defaultEmptySpec: any = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: {},
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};

async function main() {
  const spec: any = YAML.load(
    fs.readFileSync(
      "./projects/snyk-rules/end-end-tests/api-standards/resources/thing/2021-11-10/002-ok-add-operation.yaml",
      "utf-8"
    )
  );
  // const spectral = new SpectralDsl(spec, [], ruleset);
  // console.log(JSON.stringify(spectral, null, 2));
  const spectral = new Spectral();
  spectral.setRuleset(ruleset as any);
  spectral.run(defaultEmptySpec).then((results) => {
    console.log(JSON.stringify(results, null, 2));
  });
}

main();
