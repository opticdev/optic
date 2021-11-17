import { SpectralDsl } from "@useoptic/api-checks";
import ruleset from "./rulesets/spectral/ruleset";

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
  const spectral = new SpectralDsl(defaultEmptySpec);
  spectral.addRuleset(ruleset);
  const results = await spectral.run();
  console.log(JSON.stringify(results, null, 2));
}

main();
