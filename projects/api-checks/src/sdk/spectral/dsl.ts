import { ApiCheckDsl, OpenAPIV3, Result } from "../..";
import { IRuleResult, Spectral } from "@stoplight/spectral-core";
import { RulesetDefinition } from "@stoplight/spectral-core/dist/ruleset/types";
import { IParsedResult } from "@stoplight/spectral-core/dist/document";

// TODO: fix types here
export class SpectralDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];
  private ruleset: any = [];

  constructor(private nextJson: OpenAPIV3.Document) {}

  addRuleset(ruleset: any) {
    this.ruleset = ruleset;
  }

  async run() {
    const spectral = new Spectral();
    spectral.setRuleset(this.ruleset);
    const results = await spectral.run(this.nextJson as any);
    // TODO: this needs to convert the result to Optic results
    return results;
  }

  checkPromises() {
    return this.checks;
  }
}
