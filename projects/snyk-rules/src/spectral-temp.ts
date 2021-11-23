import { SpectralDsl } from "@useoptic/api-checks";
import ruleset from "./rulesets/spectral/ruleset";
import { Spectral } from "@stoplight/spectral-core";
import * as fs from "fs";
import YAML from "js-yaml";
import { SnykApiCheckDsl } from "./dsl";
import { newSnykApiCheckService } from "./service";
import { loadSpecFromFile } from "@useoptic/openapi-io";
import { spec } from "@useoptic/api-checks/build/sdk/test/select-when-rule.test";

export const defaultEmptySpec: any = {
  openapi: "3.0.1",
  paths: {
    "/example": {
      get: { responses: {} },
    },
  },
  info: { version: "0.0.0", title: "Empty" },
};

async function main() {
  // const spec: any = YAML.load(
  //   fs.readFileSync(
  //     "./projects/snyk-rules/end-end-tests/api-standards/resources/thing/2021-11-10/000-baseline.yaml",
  //     "utf-8"
  //   )
  // );
  const specFile = await loadSpecFromFile(
    "./projects/snyk-rules/end-end-tests/api-standards/resources/thing/2021-11-10/000-baseline.yaml"
  );
  if (specFile.flattened) {
    // const spectralDSL = new SpectralDsl(specFile.flattened, [], ruleset);
    // console.log(JSON.stringify(specFile.flattened));
    // process.exit();
    const spectral = new Spectral();
    spectral.setRuleset(ruleset as any);
    const spec = JSON.parse(JSON.stringify(specFile.flattened, null, 2));
    const results = await spectral.run(specFile.flattened as any);
    console.log(results);

    // const apiCheckService = newSnykApiCheckService();
    // const result = await apiCheckService.runRules(
    //   specFile.flattened,
    //   specFile.flattened,
    //   {} as any
    // );
    // console.log(
    //   YAML.dump()
    // );
  }

  //
  // // console.log(JSON.stringify(spectral, null, 2));
  // const spectral = new Spectral();
  // spectral.setRuleset(ruleset as any);
  // spectral.run(defaultEmptySpec).then((results) => {
  //   console.log(JSON.stringify(results, null, 2));
  // });
}

main();
