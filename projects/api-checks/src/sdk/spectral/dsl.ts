import { ISpectralDiagnostic, Spectral } from '@stoplight/spectral-core';
import {
  ApiCheckDsl,
  Result,
  ConceptualLocation,
  IFact,
  ILocation,
  OpenApiFact,
  OpenApiKind,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import isEqual from 'lodash.isequal';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

// TODO: fix types here
export class SpectralDsl implements ApiCheckDsl {
  private checks: Promise<Result>[] = [];

  public spectralChecksResults: Promise<Result[]>;

  constructor(
    private nextJson: OpenAPIV3.Document,
    private nextFacts: IFact<OpenApiFact>[],
    private ruleset: any
  ) {
    this.spectralChecksResults = this.run();
  }

  async run() {
    const spectral = new Spectral();
    spectral.setRuleset(this.ruleset);
    const operations = this.nextFacts.filter(
      (i) => i.location.kind === OpenApiKind.Operation
    );

    const results: ISpectralDiagnostic[] = await spectral.run(
      this.nextJson as any
    );

    const opticResult: Result[] = results.map((spectralResult) => {
      const operationPath = spectralResult.path.slice(0, 3);
      const matchingOperation = operations.find((i) =>
        isEqual(i.location.conceptualPath, operationPath)
      );

      const location: ILocation = {
        conceptualLocation: (matchingOperation
          ? matchingOperation.location.conceptualLocation
          : { path: 'This Specification', method: '' }) as ConceptualLocation,
        jsonPath: jsonPointerHelpers.compile(
          spectralResult.path.map((i) => i.toString())
        ),
        conceptualPath: [],
        kind: 'API' as any,
      };

      return {
        condition: spectralResult.code.toString(),
        passed: false,
        error: spectralResult.message,
        isMust: true,
        isShould: false,
        where: 'requirement ',
        change: {
          location,
        } as any,
      };
    });

    return opticResult;
  }

  checkPromises() {
    return this.checks;
  }
}
