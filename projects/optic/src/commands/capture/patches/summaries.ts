import chalk from 'chalk';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ParseResult } from '../../../utils/spec-loaders';
import { logger } from '../../../logger';

import { jsonPointerLogger } from '@useoptic/openapi-io';
import { SpecPatch } from '../patches/patchers/spec/patches';
import { getSourcemapLink, sourcemapReader } from '@useoptic/openapi-utilities';
import { UnpatchableDiff } from './patchers/shapes/diff';

export type GroupedUnpatchableDiff = Omit<UnpatchableDiff, 'example'> & {
  examples: any[];
};

type PatchLocation =
  | {
      type: 'request';
    }
  | {
      type: 'request-param';
    }
  | {
      type: 'response';
      statusCode: number;
    }
  | {
      type: 'response-header';
      statusCode: number;
    };

function getShapeDiffDetails(
  description: string,
  pathToHighlight: string,
  error: string,
  pointerLogger: ReturnType<typeof jsonPointerLogger>
): string {
  const lines = `${chalk.bgRed('  Diff  ')} ${description}
${pointerLogger.log(pathToHighlight, {
  highlightColor: 'yellow',
  observation: error,
})}\n`;
  return lines;
}

function locationFromPath(path: string): {
  text: string;
  location: PatchLocation;
} {
  // expected patterns:
  // /paths/:path/:method/requestBody
  // /paths/:path/:method/responses/:statusCode
  const parts = jsonPointerHelpers.decode(path);
  if (parts[3] === 'requestBody') {
    return {
      text: '[request body]',
      location: { type: 'request' },
    };
  } else if (parts[3] === 'responses' && parts[4]) {
    const statusCode = parts[4];
    return {
      text: `[${statusCode} response body]`,
      location: { type: 'response', statusCode: Number(statusCode) },
    };
  }

  return { text: '', location: { type: 'request' } };
}

function summarizePatch(
  patch: SpecPatch,
  parseResult: ParseResult,
  options: {
    mode: 'update' | 'verify';
    verbose: boolean;
  }
): { summarized: string[]; location: PatchLocation } | null {
  const verbose = options.verbose && options.mode === 'verify';
  const { jsonLike: spec, sourcemap } = parseResult;
  const pointerLogger = jsonPointerLogger(sourcemap);
  const { diff, path, groupedOperations } = patch;
  const color = options.mode === 'update' ? chalk.green : chalk.red;
  if (!diff || groupedOperations.length === 0) return null;
  if (diff.kind === 'MissingRequestBody') {
    const action =
      options.mode === 'update' ? 'is now optional' : 'is required and missing';
    return {
      summarized: [color(`[request body] body ${action}`)],
      location: { type: 'request' },
    };
  } else if (
    diff.kind === 'UnmatchdResponseBody' ||
    diff.kind === 'UnmatchedRequestBody' ||
    diff.kind === 'UnmatchedResponseStatusCode'
  ) {
    const location: PatchLocation =
      diff.kind === 'UnmatchedRequestBody'
        ? { type: 'request' }
        : { type: 'response', statusCode: Number(diff.statusCode) };

    const action =
      options.mode === 'update' ? 'has been added' : 'is not documented';
    return {
      location,
      summarized: [
        color(
          `${
            diff.kind === 'UnmatchedRequestBody'
              ? '[request body]'
              : `[${diff.statusCode} response body]`
          } body ${action}`
        ),
      ],
    };
  } else if (
    diff.kind === 'UnmatchedRequestParameter' ||
    diff.kind === 'UnmatchedResponseHeader'
  ) {
    const location: PatchLocation =
      diff.kind === 'UnmatchedRequestParameter'
        ? { type: 'request-param' }
        : { type: 'response-header', statusCode: Number(diff.statusCode) };

    const action =
      options.mode === 'update' ? 'has been added' : 'is not documented';
    return {
      location,
      summarized: [
        color(
          `${
            diff.kind === 'UnmatchedRequestParameter'
              ? `[${diff.in} parameter]`
              : `[${diff.statusCode} response header]`
          } ${diff.name} ${action}`
        ),
      ],
    };
  } else if (
    diff.kind === 'MissingRequiredRequiredParameter' ||
    diff.kind === 'MissingRequiredResponseHeader'
  ) {
    const location: PatchLocation =
      diff.kind === 'MissingRequiredRequiredParameter'
        ? { type: 'request-param' }
        : { type: 'response-header', statusCode: Number(diff.statusCode) };

    const action =
      options.mode === 'update' ? 'is now optional' : 'is required and missing';
    return {
      location,
      summarized: [
        color(
          `${
            diff.kind === 'MissingRequiredRequiredParameter'
              ? `[${diff.in} parameter]`
              : `[${diff.statusCode} response header]`
          } ${diff.name} ${action}`
        ),
      ],
    };
  } else {
    const location = locationFromPath(path);

    if (diff.kind === 'AdditionalProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.parentObjectPath)
        ).match
      )
        return null;

      const action =
        options.mode === 'update' ? 'has been added' : 'is not documented';
      const propertyLocation =
        options.mode === 'update'
          ? `(${diff.propertyPath})`
          : diff.parentObjectPath
            ? `(${diff.parentObjectPath})`
            : '';
      return {
        summarized: [
          color(`${location.text} '${diff.key}' ${action} ${propertyLocation}`),
        ],
        location: location.location,
      };
    } else if (diff.kind === 'UnmatchedType') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return null;
      let action: string;
      if (diff.keyword === 'oneOf') {
        action =
          options.mode === 'update'
            ? 'now matches schema'
            : `does not match schema`;
      } else {
        action =
          options.mode === 'update'
            ? `is now type ${diff.expectedType}`
            : `does not match type ${diff.expectedType}. Received ${diff.example}`;
      }
      const color = options.mode === 'update' ? chalk.yellow : chalk.red;

      const lines = [
        color(
          `${location.text} '${diff.key}' ${action} (${diff.propertyPath})`
        ),
      ];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff.description,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `[Actual] ${JSON.stringify(diff.example)}`,
            pointerLogger
          )
        );
      }
      return { summarized: lines, location: location.location };
    } else if (diff.kind === 'MissingRequiredProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return null;

      const action =
        options.mode === 'update'
          ? `is now optional`
          : `is required and missing`;
      const color = options.mode === 'update' ? chalk.yellow : chalk.red;

      const lines = [
        color(
          `${location.text} '${diff.key}' ${action} (${diff.propertyPath})`
        ),
      ];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff.description,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `missing`,
            pointerLogger
          )
        );
      }
      return { summarized: lines, location: location.location };
    } else if (diff.kind === 'MissingEnumValue') {
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        return null;

      const action =
        options.mode === 'update'
          ? `now has enum value '${diff.value}'`
          : `missing enum value '${diff.value}'`;
      const color = options.mode === 'update' ? chalk.yellow : chalk.red;

      const lines = [
        color(
          `${location.text} '${diff.key}' ${action} (${diff.propertyPath})`
        ),
      ];
      if (verbose) {
        lines.push(
          getShapeDiffDetails(
            diff.description,
            jsonPointerHelpers.join(path, diff.propertyPath),
            `missing enum value '${diff.value}'`,
            pointerLogger
          )
        );
      }
      return { summarized: lines, location: location.location };
    }
  }

  return null;
}

function summarizeUnpatchableDiff(
  diff: GroupedUnpatchableDiff,
  parseResult: ParseResult,
  options: {
    mode: 'update' | 'verify';
    verbose: boolean;
  }
): { summarized: string[]; location: PatchLocation } {
  const verbose = options.verbose && options.mode === 'verify';
  const pointerLogger = jsonPointerLogger(parseResult.sourcemap);
  const reader = sourcemapReader(parseResult.sourcemap);
  const { path: jsonPath, validationError, examples } = diff;
  const location = locationFromPath(jsonPath);
  const summarizedExamples =
    examples
      .slice(0, 3)
      .map((e) => JSON.stringify(e))
      .join(', ') +
    (examples.length > 3 ? ` and ${examples.length - 3} other values` : '');

  const lines = [
    chalk.red(
      `${location.text} schema (${diff.schemaPath}) with keyword '${
        validationError.keyword
      }' and parameters ${JSON.stringify(
        validationError.params
      )} received invalid values ${summarizedExamples}`
    ),
  ];
  if (options.mode === 'update') {
    const sourcemap = reader.findFileAndLines(jsonPath);
    lines.push(
      chalk.red(
        ` ⛔️ schema could not be automatically updated. Update the schema manually` +
          (sourcemap ? ` at ${getSourcemapLink(sourcemap)}` : '')
      )
    );
  }
  if (verbose) {
    lines.push(
      getShapeDiffDetails(
        'interaction did not match schema',
        jsonPath,
        `[Actual] ${summarizedExamples}`,
        pointerLogger
      )
    );
  }
  return { summarized: lines, location: location.location };
}

export class EndpointPatchSummaries {
  private patches: {
    requestParams: string[];
    requestBody: string[];
    responses: Map<
      number,
      {
        headers: string[];
        body: string[];
      }
    >;
  };
  constructor(
    private parseResult: ParseResult,
    private options: {
      update?: 'documented' | 'interactive' | 'automatic';
      verbose: boolean;
    }
  ) {
    this.patches = {
      requestParams: [],
      requestBody: [],
      responses: new Map(),
    };
  }

  addPatch(patchOrDiff: SpecPatch | GroupedUnpatchableDiff) {
    const patchDetails =
      'unpatchable' in patchOrDiff
        ? summarizeUnpatchableDiff(patchOrDiff, this.parseResult, {
            mode: this.options.update ? 'update' : 'verify',
            verbose: this.options.verbose,
          })
        : summarizePatch(patchOrDiff, this.parseResult, {
            mode: this.options.update ? 'update' : 'verify',
            verbose: this.options.verbose,
          });
    if (patchDetails) {
      const { summarized, location } = patchDetails;
      if (logger.getLevel() <= 1 && patchOrDiff.interaction) {
        summarized.push(
          `Originating request: ${JSON.stringify(patchOrDiff.interaction)}`
        );
      }
      switch (location.type) {
        case 'request': {
          this.patches.requestBody.push(...summarized);
          break;
        }
        case 'request-param': {
          this.patches.requestParams.push(...summarized);
          break;
        }
        case 'response': {
          const responsePatches = this.patches.responses.get(
            location.statusCode
          ) ?? { headers: [], body: [] };
          responsePatches.body.push(...summarized);
          this.patches.responses.set(location.statusCode, responsePatches);
          break;
        }
        case 'response-header': {
          const responsePatches = this.patches.responses.get(
            location.statusCode
          ) ?? { headers: [], body: [] };
          responsePatches.headers.push(...summarized);
          break;
        }
      }
    }
  }

  getPatchSummaries(): string[] {
    const patchSummaries: string[] = [
      ...this.patches.requestParams,
      ...this.patches.requestBody,
    ];

    // sort by asc status code
    const sortedResponses = [...this.patches.responses.entries()].sort(
      ([a], [b]) => a - b
    );
    for (const [, response] of sortedResponses) {
      patchSummaries.push(...response.headers, ...response.body);
    }
    return patchSummaries;
  }
}
