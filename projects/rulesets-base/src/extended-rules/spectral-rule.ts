import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  IFact,
  IChange,
  OpenAPIV3,
  Result,
  constructFactTree,
  getFactForJsonPath,
} from '@useoptic/openapi-utilities';
import { ExternalRuleBase } from '../rules/external-rule-base';

type Lifecycle = 'added' | 'addedOrChanged' | 'changed' | 'always';

// Spectral results will be returned if they fail
export interface SpectralResult {
  path: (string | number)[];
  code: string | number;
  message: string;
}

export interface Spectral {
  run: (jsonSpec: any) => Promise<SpectralResult[]>;
}

function toOpticResult(
  spectralResult: SpectralResult,
  lifecycle: Lifecycle,
  relevantChangeOrFact: IFact | IChange
): Result {
  return {
    condition: spectralResult.code.toString(),
    passed: false,
    error: spectralResult.message,
    isMust: true,
    isShould: false,
    where: `${lifecycle} `,
    change: relevantChangeOrFact,
  };
}

export class SpectralRule extends ExternalRuleBase {
  private lifecycle: Lifecycle;
  constructor(
    private spectral: Spectral,
    options?: {
      applies?: Lifecycle;
    }
  ) {
    super();
    this.lifecycle = options?.applies ?? 'always';
  }

  async runRules(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document<{}>;
    currentJsonLike: OpenAPIV3.Document<{}>;
  }): Promise<Result[]> {
    const factTree = constructFactTree(inputs.nextFacts);

    const changesByJsonPath: Record<string, IChange> = inputs.changelog.reduce(
      (acc, next) => {
        acc[next.location.jsonPath] = next;
        return acc;
      },
      {}
    );

    const spectralResults = await this.spectral.run(inputs.nextJsonLike);
    const results: Result[] = [];

    for (const spectralResult of spectralResults) {
      const path = jsonPointerHelpers.compile(
        spectralResult.path.map((p) => String(p))
      );
      const fact = getFactForJsonPath(path, factTree);
      if (!fact) {
        continue;
      }

      if (this.lifecycle === 'always') {
        results.push(toOpticResult(spectralResult, 'always', fact));
      } else {
        // find if there is an appropriate change
        const maybeChange: IChange | undefined =
          changesByJsonPath[fact.location.jsonPath];
        if (maybeChange) {
          if (this.lifecycle === 'added' && maybeChange.added) {
            results.push(toOpticResult(spectralResult, 'added', maybeChange));
          } else if (this.lifecycle === 'changed' && maybeChange.changed) {
            results.push(toOpticResult(spectralResult, 'changed', maybeChange));
          } else if (
            this.lifecycle === 'addedOrChanged' &&
            (maybeChange.added || maybeChange.changed)
          ) {
            results.push(
              toOpticResult(spectralResult, 'addedOrChanged', maybeChange)
            );
          }
        }
      }
    }
    return results;
  }
}
