import {
  OpenAPIV3,
  CoverageNode,
  ApiCoverage,
  countOperationCoverage,
} from '@useoptic/openapi-utilities';
import chalk from 'chalk';
import sortby from 'lodash.sortby';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { computeEndpointChecksum } from '../../../utils/checksum';
import { statusRangePattern } from '../../oas/operations';
import { SpecPatch } from '../../oas/specs';
import { denormalize } from '@useoptic/openapi-io';

export class ApiCoverageCounter {
  coverage: ApiCoverage;
  constructor(spec: OpenAPIV3.Document) {
    this.coverage = {
      paths: {},
    };
    const { jsonLike: denormalizedSpec } = denormalize({
      jsonLike: JSON.parse(JSON.stringify(spec)),
    });

    Object.entries(denormalizedSpec.paths ?? {}).forEach(([path, methods]) => {
      this.coverage.paths[path] = {};
      Object.entries(methods || {}).forEach((entry) => {
        const [method, operation] = entry as [
          OpenAPIV3.HttpMethods,
          OpenAPIV3.OperationObject,
        ];

        if (Object.values(OpenAPIV3.HttpMethods).includes(method)) {
          this.addEndpoint(operation, path, method, { newlyDocumented: false });
        }
      });
    });
  }

  addEndpoint(
    operation: OpenAPIV3.OperationObject,
    path: string,
    method: string,
    options: { newlyDocumented: boolean }
  ) {
    const responses: {
      [statusCode: string]: CoverageNode;
    } = {};
    const initialSeen = options.newlyDocumented;

    Object.keys(operation.responses || {}).forEach((res) => {
      responses[res] = { seen: initialSeen, diffs: false };
    });

    const endpointChecksum = computeEndpointChecksum(path, method, operation);

    this.coverage.paths[path][method] = {
      checksum: endpointChecksum,
      interactions: 0,
      responses,
      requestBody: operation.requestBody
        ? { seen: initialSeen, diffs: false }
        : undefined,
      seen: initialSeen,
      diffs: false,
    };
  }

  operationInteraction = (
    pathPattern: string,
    method: string,
    hasRequestBody: boolean,
    responseStatusCodeMatcher?: string
  ) => {
    const operation = this.coverage.paths[pathPattern]?.[method];
    if (operation) {
      operation.interactions++;
      operation.seen = true;
      if (hasRequestBody && operation.requestBody)
        operation.requestBody.seen = true;

      let partialMatch;
      // exact match
      if (responseStatusCodeMatcher) {
        if (operation.responses[responseStatusCodeMatcher]) {
          operation.responses[responseStatusCodeMatcher].seen = true;
        } else if (
          (partialMatch = partialMatches(
            Object.keys(operation.responses),
            responseStatusCodeMatcher
          ))
        ) {
          operation.responses[partialMatch].seen = true;
        } else if (operation.responses['default']) {
          operation.responses['default'].seen = true;
        }
      }
    }
  };

  shapeDiff = (patch: SpecPatch) => {
    const parts = jsonPointerHelpers.decode(patch.path);
    const [_, pathPattern, method] = parts;
    const operation = this.coverage.paths[pathPattern]?.[method];
    if (operation) {
      if (
        patch.diff?.kind === 'UnmatchedType' ||
        patch.diff?.kind === 'AdditionalProperty' ||
        patch.diff?.kind === 'MissingRequiredProperty'
      ) {
        const isResponse = jsonPointerHelpers.startsWith(patch.path, [
          'paths',
          '**',
          '**',
          'responses',
        ]);
        if (isResponse) {
          const [, _pathPattern, _method, , statusCode] = parts;
          if (operation.responses[statusCode]) {
            operation.responses[statusCode].diffs = true;
          }
        } else {
          if (operation.requestBody) {
            operation.requestBody.diffs = true;
          }
        }
      }
    }
  };

  calculateCoverage = () => {
    let branches = 0;
    let count = 0;
    let interactions = 0;
    Object.entries(this.coverage.paths).forEach(([_, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        branches++;
        if (operation.seen) count++;
        interactions += operation.interactions;

        if (operation.requestBody) {
          branches++;
          if (operation.requestBody.seen) count++;
        }

        Object.entries(operation.responses).forEach(([_, response]) => {
          branches++;
          if (response.seen) count++;
        });
      });
    });

    return {
      branches,
      count,
      percent: branches === 0 ? 0 : ((count / branches) * 100).toFixed(1),
      totalRequests: interactions,
    };
  };

  renderCoverage = () => {
    const { percent } = this.calculateCoverage();

    console.log(' ' + chalk.bold.underline(`Coverage Report ${percent}%`));

    const toPrint: [number, string][] = [];

    Object.entries(this.coverage.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const seen = countOperationCoverage(operation, (x) => x.seen);
        const max = countOperationCoverage(operation, () => true);
        const percentCovered = (seen / max) * 100;

        const responses = ` ${percentCovered !== 0 ? '●' : '◌'}${
          percentCovered > 25 ? '●' : '◌'
        }${percentCovered > 50 ? '●' : '◌'}${percentCovered > 75 ? '●' : '◌'} `;

        const line1 =
          seen === 0
            ? chalk.dim.bold(`${responses}  ${method} ${path}`)
            : chalk.bold(`${responses}  ${method} ${path}`);
        let line2Items: string[] = [
          ' ' + operation.interactions.toString().padStart(4, ' ') + '  ',
        ];

        if (operation.requestBody) {
          line2Items.push(
            operation.requestBody.seen
              ? chalk.green('RequestBody')
              : chalk.dim('RequestBody')
          );
        }

        Object.entries(operation.responses).forEach(
          ([statusCode, response]) => {
            if (response.seen) {
              line2Items.push(chalk.green(statusCode));
            } else {
              line2Items.push(chalk.dim(statusCode));
            }
          }
        );

        toPrint.push([
          operation.interactions,
          `${line1}\n${line2Items.join(' ')}`,
        ]);
      });
    });

    sortby(toPrint, (cov) => 1 - cov[0]).forEach((cov) => console.log(cov[1]));

    console.log('');
  };
}

function partialMatches(
  statusCodes: string[],
  current: string
): string | undefined {
  return statusCodes.find((code) => {
    if (
      statusRangePattern.test(code) &&
      code.substring(0, 1) === current.substring(0, 1)
    ) {
      return true;
    }
  });
}
