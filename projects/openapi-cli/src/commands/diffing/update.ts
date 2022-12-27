import { SpecPatch, SpecPatches } from '../../specs';
import { jsonPointerLogger, JsonSchemaSourcemap } from '@useoptic/openapi-io';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import chalk from 'chalk';
import { ShapeDiffResult } from '../../shapes/diffs';
import { patchHash } from '../../lib/patch-hash';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export async function renderDiffs(
  sourcemap: JsonSchemaSourcemap,
  spec: OpenAPIV3.Document,
  patches: SpecPatches
) {
  const logger = jsonPointerLogger(sourcemap);

  let stats = {
    totalDiffCount: 0,
    undocumentedBody: 0,
    shapeDiff: 0,
  };

  for await (const patch of patches) {
    const { diff, path, description, groupedOperations } = patch;

    const [_, pathPattern, method] = jsonPointerHelpers.decode(path);

    if (!diff || groupedOperations.length === 0) continue;

    stats.totalDiffCount++;

    if (
      diff.kind === 'UnmatchdResponseBody' ||
      diff.kind === 'UnmatchedRequestBody' ||
      diff.kind === 'UnmatchedResponseStatusCode'
    ) {
      stats.undocumentedBody++;

      const description =
        diff.kind === 'UnmatchedResponseStatusCode'
          ? `${diff.statusCode} Response ${diff.contentType}`
          : diff.kind === 'UnmatchedRequestBody'
          ? `${diff.contentType} Request body`
          : diff.kind === 'UnmatchdResponseBody'
          ? `${diff.statusCode} Response ${diff.contentType}`
          : '';

      renderBodyDiff(description, method, pathPattern);
    } else if (diff.kind === 'AdditionalProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.parentObjectPath)
        ).match
      )
        continue;

      stats.shapeDiff++;
      renderShapeDiff(
        diff,
        jsonPointerHelpers.join(path, diff.parentObjectPath),
        `Undocumented '${diff.key}'`,
        logger,
        method,
        pathPattern
      );
    } else if (diff.kind === 'UnmatchedType') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        continue;

      stats.shapeDiff++;
      renderShapeDiff(
        diff,
        jsonPointerHelpers.join(path, diff.propertyPath),
        `[Actual] ${JSON.stringify(diff.example)}`,
        logger,
        method,
        pathPattern
      );
    } else if (diff.kind === 'MissingRequiredProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        continue;

      stats.shapeDiff++;
      renderShapeDiff(
        diff,
        jsonPointerHelpers.join(path, diff.propertyPath),
        `missing`,
        logger,
        method,
        pathPattern
      );
    } else {
      console.log('Unrecognized diff type ' + diff.kind);
    }
  }

  return stats;
}

function renderShapeDiff(
  diff: ShapeDiffResult,
  pathToHighlight: string,
  error: string,
  logger: any,
  method: string,
  pathPattern: string
) {
  const lines = `${chalk.bgRed('  Diff  ')} ${diff.description}
${logger.log(pathToHighlight, {
  highlightColor: 'yellow',
  observation: error,
})}
  ${chalk.gray.bold(
    `use (--update "${method} ${pathPattern}") to patch \n\n`
  )}`;
  console.log(lines);
}

function renderBodyDiff(
  description: string,
  method: string,
  pathPattern: string
) {
  const lines = `${chalk.bgYellow('  Undocumented  ')} ${description}
  ${method} ${pathPattern}
  ${chalk.gray.bold(
    `use (--update "${method} ${pathPattern}") to patch \n\n`
  )}`;
  console.log(lines);
}
