import { ApiCheckDsl, OpenAPIV3, Result } from "../..";
import { Spectral } from "@stoplight/spectral-core";

export class SpectralDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  constructor(private nextJson: OpenAPIV3.Document) {}

  addRuleset() {
    const spectral = new Spectral();
    spectral.run(this.nextJson as any).then((results) => {
      console.log("here are the results", results);
    });
  }

  checkPromises() {
    return this.checks;
  }
}
