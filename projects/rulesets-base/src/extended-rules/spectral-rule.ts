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
import { isExempted } from '../rule-runner/utils';

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
  relevantChangeOrFact: IFact | IChange,
  opts: {
    exempted: boolean;
    docsLink?: string;
  }
): Result {
  return {
    condition: spectralResult.code.toString(),
    exempted: opts.exempted,
    docsLink: opts.docsLink,
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
  public name: string;
  public docsLink?: string;
  constructor(
    private spectral: Spectral,
    options?: {
      applies?: Lifecycle;
      docsLink?: string;
    }
  ) {
    super();
    this.lifecycle = options?.applies ?? 'always';
    this.name = 'spectral';
    this.docsLink = options?.docsLink;
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

      // This exemption is actually on the Fact level, rather than the spectral path
      // This is for consistency with our current rule engine. In the future we should attach exemptions on the nodes which trigger them, which would require us to rework the rules engine
      const rawForPath = jsonPointerHelpers.get(
        inputs.nextJsonLike,
        fact.location.jsonPath
      );
      const exempted = isExempted(rawForPath, this.name);

      // TODO in the future update to pass in the JSON path from spectral, rather than the fact json path
      if (this.lifecycle === 'always') {
        results.push(
          toOpticResult(spectralResult, 'always', fact, {
            exempted,
            docsLink: this.docsLink,
          })
        );
      } else {
        // find if there is an appropriate change
        const maybeChange: IChange | undefined =
          changesByJsonPath[fact.location.jsonPath];
        if (maybeChange) {
          if (this.lifecycle === 'added' && maybeChange.added) {
            results.push(
              toOpticResult(spectralResult, 'added', maybeChange, {
                exempted,
                docsLink: this.docsLink,
              })
            );
          } else if (this.lifecycle === 'changed' && maybeChange.changed) {
            results.push(
              toOpticResult(spectralResult, 'changed', maybeChange, {
                exempted,
                docsLink: this.docsLink,
              })
            );
          } else if (
            this.lifecycle === 'addedOrChanged' &&
            (maybeChange.added || maybeChange.changed)
          ) {
            results.push(
              toOpticResult(spectralResult, 'addedOrChanged', maybeChange, {
                exempted,
                docsLink: this.docsLink,
              })
            );
          }
        }
      }
    }
    return results;
  }
}
