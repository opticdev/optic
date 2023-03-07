import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import chalk from 'chalk';
import { statusRangePattern } from '../operations';
import sortby from 'lodash.sortby';
export type ApiCoverage = {
  paths: {
    [pathPattern: string]: {
      [methods: string]: {
        count: number;
        requestBody: {
          count: number;
          expected: boolean;
        };
        responses: {
          [statusCode: string]: {
            count: number;
          };
        };
      };
    };
  };
  counts: {
    total: number;
  };
};

export class ApiCoverageCounter {
  constructor(spec: OpenAPIV3.Document) {
    this.coverage = {
      paths: {},
      counts: { total: 0 },
    };

    Object.entries(spec.paths).forEach(([path, methods]) => {
      this.coverage.paths[path] = {};
      Object.entries(methods || {}).forEach((entry) => {
        const [method, operation] = entry as [
          string,
          OpenAPIV3.OperationObject
        ];

        if (Object.values(OpenAPIV3.HttpMethods).includes(method as any)) {
          const responses = {};

          Object.keys(operation.responses || {}).forEach((res) => {
            responses[res] = { count: 0 };
          });

          this.coverage.paths[path][method] = {
            responses,
            requestBody: { count: 0, expected: Boolean(operation.requestBody) },
            count: 0,
          };
        }
      });
    });
  }
  private coverage: ApiCoverage;
  unmatched = () => {
    this.coverage.counts.total++;
  };
  operationInteraction = (
    pathPattern: string,
    method: string,
    hasRequestBody: boolean,
    responseStatusCodeMatcher: string
  ) => {
    if (
      this.coverage.paths[pathPattern] &&
      this.coverage.paths[pathPattern][method]
    ) {
      this.coverage.counts.total++;
      const item = this.coverage.paths[pathPattern][method]!;
      item.count++;
      if (hasRequestBody) item.requestBody.count++;

      let partialMatch;
      // exact match
      if (item.responses[responseStatusCodeMatcher]) {
        item.responses[responseStatusCodeMatcher].count++;
      } else if (
        (partialMatch = partialMatches(
          Object.keys(item.responses),
          responseStatusCodeMatcher
        ))
      ) {
        item.responses[partialMatch].count++;
      } else if (item.responses['default']) {
        item.responses['default'].count++;
      }
    }
  };

  calculateCoverage = () => {
    let branches = 0;
    let count = 0;
    Object.entries(this.coverage.paths).forEach(([_, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        branches++;
        if (operation.count > 0) count++;

        if (operation.requestBody.expected) {
          branches++;
          if (operation.requestBody.count > 0) count++;
        }

        Object.entries(operation.responses).forEach(([_, resCounter]) => {
          branches++;
          if (resCounter.count > 0) count++;
        });
      });
    });

    return {
      branches,
      count,
      percent: branches === 0 ? 0 : ((count / branches) * 100).toFixed(1),
      totalRequests: this.coverage.counts.total,
    };
  };

  renderCoverage = () => {
    const { percent } = this.calculateCoverage();

    const peerCounts: number[] = [];
    Object.entries(this.coverage.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        peerCounts.push(operation.count);
      });
    });

    const max = Math.max(...peerCounts);

    console.log(' ' + chalk.bold.underline(`Coverage Report ${percent}%`));

    const toPrint: [number, string][] = [];

    Object.entries(this.coverage.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const percentOfLargest = (operation.count / max) * 100;

        const responses = ` ${percentOfLargest !== 0 ? '●' : '◌'}${
          percentOfLargest > 25 ? '●' : '◌'
        }${percentOfLargest > 50 ? '●' : '◌'}${
          percentOfLargest > 75 ? '●' : '◌'
        } `;

        const line1 =
          operation.count === 0
            ? chalk.dim.bold(`${responses}  ${method} ${path}`)
            : chalk.bold(`${responses}  ${method} ${path}`);
        let line2Items: string[] = [
          ' ' + operation.count.toString().padStart(4, ' ') + '  ',
        ];

        if (operation.requestBody.expected) {
          if (operation.requestBody.count > 0) {
            line2Items.push(chalk.green('RequestBody'));
          } else {
            line2Items.push(chalk.dim('RequestBody'));
          }
        }

        Object.entries(operation.responses).forEach(
          ([statusCode, resCounter]) => {
            if (resCounter.count > 0) {
              line2Items.push(chalk.green(statusCode));
            } else {
              line2Items.push(chalk.dim(statusCode));
            }
          }
        );

        toPrint.push([operation.count, `${line1}\n${line2Items.join(' ')}`]);
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
