import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { IFact, IChange, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { ExternalRuleBase } from './external-rule-base';

type Lifecycle = 'added' | 'addedOrChanged' | 'changed' | 'always';
type FactTree = Record<string, { fact: IFact | null; children: FactTree }>;

// Spectral results will be returned if they fail
export interface SpectralResult {
  path: (string | number)[];
  code: string | number;
  message: string;
}

export interface Spectral {
  run: (jsonSpec: OpenAPIV3.Document) => Promise<SpectralResult[]>;
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

function constructFactTree(facts: IFact[]): FactTree {
  const factTree: FactTree = {};
  for (const fact of facts) {
    let tree: FactTree = factTree;
    const pathParts = jsonPointerHelpers.decode(fact.location.jsonPath);
    const leadingPaths = pathParts.slice(0, -1);
    const trailingPath = pathParts.slice(-1)[0];

    for (const part of leadingPaths) {
      if (!tree[part]) {
        tree[part] = { fact: null, children: {} };
      } else {
        tree = tree[part].children;
      }
    }
    tree[trailingPath].fact = fact;
  }

  return factTree;
}

function getFactForSpectralResult(
  spectralResult: SpectralResult,
  factTree: FactTree
): IFact | null {
  let fact: IFact | null = null;
  const pathParts = spectralResult.path.map((p) => String(p));
  let tree = factTree;
  for (const part of pathParts) {
    const node = tree[part];
    if (node.fact) {
      fact = node.fact;
    }
    tree = node.children;
  }
  return fact;
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
    const factTree: FactTree = constructFactTree(inputs.nextFacts);

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
      const fact = getFactForSpectralResult(spectralResult, factTree);
      if (!fact) {
        // TODO figure out if this is possible
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
