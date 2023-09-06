import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  constructFactTree,
  FactVariant,
  getFactForJsonPath,
  IChange,
  IFact,
  ObjectDiff,
  OpenApiKind,
  OpenAPIV3,
  OpenApiV3Traverser,
  Result,
  RuleResult,
  Severity,
  typeofDiff,
  UserError,
} from '@useoptic/openapi-utilities';
import { ExternalRuleBase } from '../rules/external-rule-base';
import {
  createRuleContextWithOperation,
  createRuleContextWithoutOperation,
  isExempted,
} from '../rule-runner/utils';
import { spawn } from 'child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { RuleContext } from '..';
import { NodeDetail, OpenAPIFactNodes } from '../rule-runner/rule-runner-types';
import {
  createOperation,
  createSpecification,
} from '../rule-runner/data-constructors';
import { getEndpointKey } from '../rule-runner/group-facts';

type Lifecycle = 'added' | 'addedOrChanged' | 'changed' | 'always';

// Definition from spectral internals
enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3,
}

// Spectral results will be returned if they fail
export interface SpectralResult {
  path: (string | number)[];
  code: string | number;
  message: string;
  severity: DiagnosticSeverity;
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

// This will treat info + hint as a info in Optic
function severityToOpticSeverity(spectralSev: DiagnosticSeverity): Severity {
  return spectralSev === DiagnosticSeverity.Error
    ? Severity.Error
    : spectralSev === DiagnosticSeverity.Warning
    ? Severity.Warn
    : Severity.Info;
}

function toOpticRuleResult(
  spectralResult: SpectralResult,
  lifecycle: Lifecycle,
  jsonPath: string,
  opts: {
    exempted: boolean;
    docsLink?: string;
  }
): RuleResult {
  return {
    exempted: opts.exempted,
    severity: severityToOpticSeverity(spectralResult.severity),
    docsLink: opts.docsLink,
    passed: false,
    error: `Error code: ${spectralResult.code.toString()}: ${
      spectralResult.message
    }`,
    where: `${lifecycle} `,
    location: {
      jsonPath,
      spec: 'after',
    },
    name: `Spectral ${lifecycle} rule`,
    type: lifecycle === 'always' ? 'requirement' : lifecycle,
  };
}

function createSpecNode(
  spec: OpenAPIV3.Document
): Parameters<typeof createRuleContextWithoutOperation>['0'] {
  const { paths, components, ...specificationFact } = spec;

  const fact: FactVariant<OpenApiKind.Specification> = {
    location: {
      jsonPath: '',
      conceptualPath: [],
      conceptualLocation: {},
      kind: OpenApiKind.Specification,
    },
    value: specificationFact,
  };
  const node: NodeDetail<OpenApiKind.Specification> = {
    before: fact,
    after: fact,
    change: null,
  };
  return {
    before: createSpecification(node, 'before', spec)!,
    after: createSpecification(node, 'after', spec)!,
    node,
  };
}

function createOperationNode(
  facts: OpenAPIFactNodes,
  jsonPath: string,
  before: OpenAPIV3.Document,
  after: OpenAPIV3.Document
): Parameters<typeof createRuleContextWithOperation>['1'] {
  const [, path, method] = jsonPointerHelpers.decode(jsonPath);

  const endpointNode = facts.endpoints.get(getEndpointKey({ path, method }))!;
  return {
    before: createOperation(endpointNode, 'before', before)!,
    after: createOperation(endpointNode, 'after', after)!,
    node: endpointNode,
  };
}

export class SpectralRule extends ExternalRuleBase {
  private lifecycle: Lifecycle;
  public name: string;
  private rulesetPointer?: string;
  private flatSpecFile?: string;
  public docsLink?: string;
  private spectral?: {
    run: (json: any) => Promise<SpectralResult[]>;
  };
  private matches?: (context: RuleContext) => boolean;
  constructor(options: {
    name: string;
    applies?: Lifecycle;
    rulesetPointer?: string;
    flatSpecFile?: string;
    docsLink?: string;
    matches?: (context: RuleContext) => boolean;
    spectral?: {
      run: (json: any) => Promise<SpectralResult[]>;
    };
  }) {
    super();
    this.name = options.name;
    this.flatSpecFile = options.flatSpecFile;
    this.rulesetPointer = options.rulesetPointer;
    this.lifecycle = options.applies ?? 'always';
    this.docsLink = options.docsLink;
    this.spectral = options.spectral;
    this.matches = options.matches;
  }

  async runRulesV2(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIV3.Document;
    toSpec: OpenAPIV3.Document;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<RuleResult[]> {
    if ((inputs.toSpec as any)['x-optic-ci-empty-spec'] === true) {
      return [];
    }
    const traverser = new OpenApiV3Traverser();
    traverser.traverse(inputs.toSpec);

    const factTree = constructFactTree([...traverser.facts()]);

    const changesByJsonPath: Record<string, ObjectDiff> = inputs.diffs.reduce(
      (acc, next) => {
        const location = next.after ?? next.before;
        acc[location] = next;
        return acc;
      },
      {}
    );

    let spectralResults: SpectralResult[];
    if (this.spectral) {
      try {
        spectralResults = await this.spectral.run(inputs.toSpec);
      } catch (e: any) {
        throw new UserError({ message: e.message ? e.message : e });
      }
    } else if (this.rulesetPointer && this.flatSpecFile) {
      try {
        const output = await runSpectral(
          this.rulesetPointer,
          this.flatSpecFile
        );
        // sometimes first line has a message
        const withoutLeading = output.substring(output.indexOf('[')).trim();
        spectralResults = JSON.parse(withoutLeading) as SpectralResult[];
      } catch (e: any) {
        throw new UserError({ message: e.message ? e.message : e });
      }
    } else {
      throw new UserError({
        message:
          'Invalid configuration for spectral rules - must provide rulesetPointer and flatSpecFile or a spectral instance',
      });
    }

    const results: RuleResult[] = [];

    for (const spectralResult of spectralResults) {
      const path = jsonPointerHelpers.compile(
        spectralResult.path.map((p) => String(p))
      );
      const fact = getFactForJsonPath(path, factTree);
      if (!fact) {
        continue;
      }

      if (this.matches) {
        const spec = {
          before: createSpecification(
            inputs.groupedFacts.specification,
            'before',
            inputs.fromSpec
          )!,
          after: createSpecification(
            inputs.groupedFacts.specification,
            'after',
            inputs.toSpec
          )!,
          node: inputs.groupedFacts.specification,
        };

        const ruleContext = jsonPointerHelpers.startsWith(path, [
          'paths',
          '**',
          '**',
        ])
          ? createRuleContextWithOperation(
              spec,
              createOperationNode(
                inputs.groupedFacts,
                path,
                inputs.fromSpec,
                inputs.toSpec
              ),
              inputs.context
            )
          : createRuleContextWithoutOperation(spec, inputs.context);
        if (!this.matches(ruleContext)) {
          continue;
        }
      }

      // This exemption is actually on the Fact level, rather than the spectral path
      // This is for consistency with our current rule engine. In the future we should attach exemptions on the nodes which trigger them, which would require us to rework the rules engine
      const rawForPath = jsonPointerHelpers.get(
        inputs.toSpec,
        fact.location.jsonPath
      );
      const exempted = isExempted(rawForPath, this.name);

      // TODO in the future update to pass in the JSON path from spectral, rather than the fact json path
      if (this.lifecycle === 'always') {
        results.push(
          toOpticRuleResult(spectralResult, 'always', fact.location.jsonPath, {
            exempted,
            docsLink: this.docsLink,
          })
        );
      } else {
        // find if there is an appropriate change
        let maybeChange: ObjectDiff | undefined =
          changesByJsonPath[fact.location.jsonPath];

        if (
          !maybeChange &&
          jsonPointerHelpers.matches(fact.location.jsonPath, [
            'paths',
            '**',
            `{${Object.values(OpenAPIV3.HttpMethods).join(',')}}`,
          ])
        ) {
          const pathPointer = jsonPointerHelpers.pop(fact.location.jsonPath);
          maybeChange = changesByJsonPath[pathPointer];
        }

        if (maybeChange) {
          const changeType = typeofDiff(maybeChange);
          if (this.lifecycle === 'added' && changeType === 'added') {
            results.push(
              toOpticRuleResult(
                spectralResult,
                'added',
                fact.location.jsonPath,
                {
                  exempted,
                  docsLink: this.docsLink,
                }
              )
            );
          } else if (this.lifecycle === 'changed' && changeType === 'changed') {
            results.push(
              toOpticRuleResult(
                spectralResult,
                'changed',
                fact.location.jsonPath,
                {
                  exempted,
                  docsLink: this.docsLink,
                }
              )
            );
          } else if (
            this.lifecycle === 'addedOrChanged' &&
            (changeType === 'added' || changeType === 'changed')
          ) {
            results.push(
              toOpticRuleResult(
                spectralResult,
                'addedOrChanged',
                fact.location.jsonPath,
                {
                  exempted,
                  docsLink: this.docsLink,
                }
              )
            );
          }
        }
      }
    }
    return results;
  }

  async runRules(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document<{}>;
    currentJsonLike: OpenAPIV3.Document<{}>;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<Result[]> {
    if ((inputs.nextJsonLike as any)['x-optic-ci-empty-spec'] === true) {
      return [];
    }
    const factTree = constructFactTree(inputs.nextFacts);

    const changesByJsonPath: Record<string, IChange> = inputs.changelog.reduce(
      (acc, next) => {
        acc[next.location.jsonPath] = next;
        return acc;
      },
      {}
    );

    let spectralResults: SpectralResult[];
    if (this.spectral) {
      try {
        spectralResults = await this.spectral.run(inputs.nextJsonLike);
      } catch (e: any) {
        throw new UserError({ message: e.message ? e.message : e });
      }
    } else if (this.rulesetPointer && this.flatSpecFile) {
      try {
        const output = await runSpectral(
          this.rulesetPointer,
          this.flatSpecFile
        );
        // sometimes first line has a message
        const withoutLeading = output.substring(output.indexOf('[')).trim();
        spectralResults = JSON.parse(withoutLeading) as SpectralResult[];
      } catch (e: any) {
        throw new UserError({ message: e.message ? e.message : e });
      }
    } else {
      throw new UserError({
        message:
          'Invalid configuration for spectral rules - must provide rulesetPointer and flatSpecFile or a spectral instance',
      });
    }

    const results: Result[] = [];

    for (const spectralResult of spectralResults) {
      const path = jsonPointerHelpers.compile(
        spectralResult.path.map((p) => String(p))
      );
      const fact = getFactForJsonPath(path, factTree);
      if (!fact) {
        continue;
      }

      if (this.matches) {
        const spec = createSpecNode(inputs.nextJsonLike);
        const ruleContext = jsonPointerHelpers.startsWith(path, [
          'paths',
          '**',
          '**',
        ])
          ? createRuleContextWithOperation(
              spec,
              createOperationNode(
                inputs.groupedFacts,
                path,
                inputs.currentJsonLike,
                inputs.nextJsonLike
              ),
              inputs.context
            )
          : createRuleContextWithoutOperation(spec, inputs.context);
        if (!this.matches(ruleContext)) {
          continue;
        }
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

async function runSpectral(
  spectralRuleset: string,
  afterSpecAbsolutePath: string
): Promise<string> {
  const resultsOutput = path.join(
    os.tmpdir(),
    `spectral-output-${Math.floor(Math.random() * 100000)}.json`
  );

  return new Promise((resolve, reject) => {
    const spectralRunning = spawn(
      'spectral',
      [
        'lint',
        afterSpecAbsolutePath,
        '--format=json',
        `--ruleset="${spectralRuleset}"`,
        `--o="${resultsOutput}"`,
      ],
      { shell: false, cwd: process.cwd(), env: process.env }
    );

    spectralRunning.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
    });

    let error = '';
    spectralRunning.stderr.on('data', function (data) {
      error = error + data.toString();
    });

    spectralRunning.on('exit', async function (code) {
      if (code !== 2) {
        resolve((await fs.readFile(resultsOutput)).toString());
        fs.unlink(resultsOutput);
      } else {
        reject(`Error running spectral ruleset ${spectralRuleset}: ${error}`);
      }
    });
    spectralRunning.on('error', () => {
      reject(
        `Error running Spectral CLI. Please install "npm install -g @stoplight/spectral-cli"`
      );
    });
  });
}
