import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  constructFactTree,
  getFactForJsonPath,
  IChange,
  IFact,
  OpenAPIV3,
  Result,
} from '@useoptic/openapi-utilities';
import { ExternalRuleBase } from '../rules/external-rule-base';
import { isExempted } from '../rule-runner/utils';
import { exec, spawn } from 'child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

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
  private rulesetPointer: string;
  private flatSpecFile: string;
  public docsLink?: string;
  constructor(options: {
    name: string;
    applies?: Lifecycle;
    rulesetPointer: string;
    flatSpecFile: string;
    docsLink?: string;
  }) {
    super();
    this.name = options.name;
    this.flatSpecFile = options.flatSpecFile;
    this.rulesetPointer = options.rulesetPointer;
    this.lifecycle = options.applies ?? 'always';
    this.docsLink = options.docsLink;
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

    let spectralResults: SpectralResult[];
    try {
      const output = await runSpectral(this.rulesetPointer, this.flatSpecFile);
      // sometimes first line has a message
      const withoutLeading = output.substring(output.indexOf('[')).trim();
      spectralResults = JSON.parse(withoutLeading) as SpectralResult[];
    } catch (e: any) {
      throw new Error(e.message ? e.message : e);
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
