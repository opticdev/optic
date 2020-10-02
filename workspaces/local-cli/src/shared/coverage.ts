import { IApiCliConfig, IPathMapping } from '@useoptic/cli-config';
import { developerDebugLogger, fromOptic } from '@useoptic/cli-shared';
import { cli } from 'cli-ux';
import path from 'path';
import fs from 'fs-extra';
import { opticEngine, Queries } from '@useoptic/domain';
import { StableHasher, universeFromEvents } from '@useoptic/domain-utilities';
const CoverageConcerns = opticEngine.com.useoptic.coverage;
import Table from 'cli-table3';
import sortBy from 'lodash.sortby';
import colors from 'colors';

export async function printCoverage(
  paths: IPathMapping,
  taskName: string,
  captureId: string
) {
  cli.action.start(fromOptic('Calculating Coverage...'));

  const input = await Promise.all([
    getSpecEndpoints(paths),
    getReport(paths, captureId),
  ]);

  const spec: KnownEndpoint[] = input[0];
  const report = input[1];

  let table = new Table({
    head: [
      colors.cyan.underline('Endpoint'),
      colors.cyan.underline('Coverage'),
    ],
  });

  let totalN = 0;
  let totalD = 0;

  let totalEndpointN = 0;
  let totalEndpointD = spec.length;

  spec.forEach((i) => {
    const endpointName = colors.bold(`${i.method.toUpperCase()} ${i.fullPath}`);

    const totalCount = report.coverageCounts.getCount(
      CoverageConcerns.TotalForPathAndMethod(i.pathId, i.method)
    );

    if (totalCount > 0) {
      totalEndpointN = totalEndpointN + 1;
    }

    const responseStats = i.descriptor.responses.map((res) => {
      const count = report.coverageCounts.getCount(
        CoverageConcerns.TotalForResponse(res.responseId)
      );

      return {
        statusCode: res.statusCode,
        responseId: res.responseId,
        count,
        copy:
          count > 0
            ? colors.green(res.statusCode + ' ✔')
            : colors.white.bgRed(res.statusCode),
        isCovered: count > 0,
      };
    });

    const requestStats = i.descriptor.requestBodies.map((req) => {
      const count = report.coverageCounts.getCount(
        CoverageConcerns.TotalForRequest(req.requestId)
      );

      const contentType = req.requestBody.httpContentType || 'No Body';
      return {
        requestId: req.requestId,
        contentType: contentType,
        count,
        copy:
          count > 0
            ? colors.green(contentType + ' ✔')
            : colors.white.bgRed(contentType),
        isCovered: count > 0,
      };
    });

    const requests = `${colors.grey(
      `Requests (${requestStats.filter((i) => i.isCovered).length}/${
        requestStats.length
      }) ${requestStats.map((i) => i.copy).join('  ')}`
    )}`;

    const responses = `${colors.grey(
      `Responses (${responseStats.filter((i) => i.isCovered).length}/${
        responseStats.length
      }) ${responseStats.map((i) => i.copy).join('  ')}`
    )}`;

    const denominator = requestStats.length + responseStats.length;
    const numerator =
      requestStats.filter((i) => i.isCovered).length +
      responseStats.filter((i) => i.isCovered).length;

    totalN = totalN + numerator;
    totalD = totalD + denominator;

    const coverageCopy = (() => {
      const percent = (numerator / (denominator || 1)) * 100;
      if (numerator == denominator) {
        return colors.bold.green(`${percent}% Full Coverage ✔`);
      } else if (numerator < denominator && numerator > 0) {
        return colors.bold.yellow(`${percent}% Partial Coverage`);
      }
      return colors.bold.red(`0% No Coverage`);
    })();

    const coverage = colors.grey(`${coverageCopy}      ${totalCount} Examples`);

    table.push([
      `${endpointName}\n\n${coverage}`,
      `${requests}\n\n${responses}`,
    ]);
  });

  //print it out
  cli.action.stop();

  console.log(colors.bold(`\n\n API Coverage Report:`));

  console.log(table.toString());

  console.log('\n\n');

  const totals = report.coverageCounts.getCount(
    CoverageConcerns.TotalInteractions()
  );

  console.log(
    colors.grey(`Based on ${totals} samples from task: ${colors.bold('start')}`)
  );

  let resultTable = new Table({
    head: [
      colors.grey.underline(''),
      colors.grey.underline('Observed'),
      colors.grey.underline('Expected'),
      colors.grey.underline('Percent Coverage'),
    ],
  });

  function colorProperly(full: boolean, partial: boolean, none: boolean) {
    return (string: string): string => {
      if (full) {
        return string;
      } else if (none) {
        return makeRed(string);
      } else if (partial) {
        return makeYellow(string);
      }
      return string;
    };
  }

  const bodyCoverageColorer = colorProperly(
    totalN === totalD,
    totalN < totalD,
    totalN === 0
  );

  const endpointCoverageColorer = colorProperly(
    totalEndpointN === totalEndpointD,
    totalEndpointN < totalEndpointD,
    totalEndpointN === 0
  );

  resultTable.push(
    [
      'Documented Body Coverage',
      totalN.toString(),
      totalD.toString(),
      Math.round((totalN / (totalD || 1)) * 100).toString() + '%',
    ].map(bodyCoverageColorer),
    [
      'Documented Endpoint Coverage',
      totalEndpointN.toString(),
      totalEndpointD.toString(),
      Math.round((totalEndpointN / (totalEndpointD || 1)) * 100).toString() +
        '%',
    ].map(endpointCoverageColorer)
  );

  console.log(resultTable.toString());
}

interface KnownEndpoint {
  method: string;
  pathId: string;
  fullPath: string;
  descriptor: SpecEndpointDescriptor;
}

async function getSpecEndpoints(paths: IPathMapping): Promise<KnownEndpoint[]> {
  const events = await fs.readJSON(paths.specStorePath);
  const { eventStore, rfcState, rfcService, rfcId } = universeFromEvents(
    events
  );

  const queries = Queries(eventStore, rfcService, rfcId);
  const cachedQueryResults = getCachedQueryResults(queries);
  const shapesResolvers = queries.shapesResolvers();
  const endpoints = queries.endpoints();
  const allEndpoints = endpoints.map((i: any) => ({
    ...i,
    fullPath: queries.absolutePath(i.pathId),
    descriptor: createEndpointDescriptor(i, cachedQueryResults),
  }));

  return sortBy(allEndpoints, (i) => i.fullPath);
}

async function getReport(paths: IPathMapping, captureId: string): Promise<any> {
  const capturesDirectory = path.join(paths.capturesPath, captureId);

  const entries = await fs.readdir(capturesDirectory);

  const coverageFiles = entries
    .filter((x) => x.startsWith('coverage-'))
    .map((x) => path.join(capturesDirectory, x));

  const reportsToMerge = await Promise.all(
    coverageFiles.map(async (i) => {
      const coverageJSON = await fs.readJSON(i);
      const asScala = opticEngine.CoverageReportJsonDeserializer.fromJs(
        coverageJSON
      );
      return asScala;
    })
  );

  const report = opticEngine.CoverageReportBuilder.emptyReport();
  //merge in all the reports
  reportsToMerge.forEach((i) => report.merge(i));

  // const finalReport = opticEngine.CoverageReportJsonSerializer.toJs(report);

  return report;
}

export function getCachedQueryResults(queries: any) {
  const contributions = queries.contributions();

  const {
    requests,
    pathComponents,
    responses,
    requestParameters,
  } = queries.requestsState();
  const pathIdsByRequestId = queries.pathsWithRequests();
  const pathsById = pathComponents;
  // const absolutePaths = Object.keys(pathsById).map(pathId => ({ [pathId]: queries.absolutePath(pathId) })).reduce((acc, value) => Object.assign(acc, value), {})
  // console.log({ absolutePaths })
  const pathIdsWithRequests = new Set(Object.values(pathIdsByRequestId));

  const endpoints = queries.endpoints();
  const shapesState = queries.shapesState();
  const shapesResolvers = queries.shapesResolvers();
  const requestIdsByPathId = Object.entries(pathIdsByRequestId).reduce(
    (acc, entry: any) => {
      const [requestId, pathId] = entry;
      //@ts-ignore
      const value = acc[pathId] || [];
      value.push(requestId);
      //@ts-ignore
      acc[pathId] = value;
      return acc;
    },
    {}
  );
  const cachedQueryResults = {
    contributions,
    requests,
    requestParameters,
    responses,
    responsesArray: Object.values(responses),
    pathIdsByRequestId,
    requestIdsByPathId,
    pathsById,
    endpoints,
    pathIdsWithRequests,
    shapesState,
    shapesResolvers,
  };
  return cachedQueryResults;
}

interface SpecEndpointDescriptor {
  httpMethod: string;
  method: string;
  pathId: string;
  requestBodies: any[];
  responses: any[];
  isEmpty: boolean;
}

export function createEndpointDescriptor(
  { method, pathId }: { method: string; pathId: string },
  cachedQueryResults: {
    requests: any[];
    pathsById: { [id: string]: any };
    requestIdsByPathId: { [id: string]: any };
    responsesArray: any[];
    contributions: any;
  }
): SpecEndpointDescriptor {
  const {
    requests,
    pathsById,
    requestIdsByPathId,
    responsesArray,
    contributions,
  } = cachedQueryResults;

  const requestIdsOnPath = (requestIdsByPathId[pathId] || []).map(
    //@ts-ignore
    (requestId) => requests[requestId]
  );
  const requestsOnPathAndMethod = requestIdsOnPath.filter(
    //@ts-ignore
    (request) => request.requestDescriptor.httpMethod === method.toUpperCase()
  );

  const requestBodies = requestsOnPathAndMethod.map(
    //@ts-ignore
    ({ requestId, requestDescriptor }) => {
      const requestBody = getNormalizedBodyDescriptor(
        requestDescriptor.bodyDescriptor
      );
      return {
        requestId,
        requestBody,
      };
    }
  );

  const responsesForPathAndMethod = sortBy(
    responsesArray
      .filter(
        (response) =>
          response.responseDescriptor.httpMethod === method.toUpperCase() &&
          response.responseDescriptor.pathId === pathId
      )
      .map(({ responseId, responseDescriptor }) => {
        const responseBody = getNormalizedBodyDescriptor(
          responseDescriptor.bodyDescriptor
        );
        return {
          responseId,
          responseBody,
          statusCode: responseDescriptor.httpStatusCode,
        };
      }),
    ['statusCode']
  );

  return {
    httpMethod: method,
    method,
    pathId,
    requestBodies,
    responses: responsesForPathAndMethod,
    isEmpty:
      requestBodies.length === 0 && responsesForPathAndMethod.length === 0,
  };
}

function getNormalizedBodyDescriptor(value: any) {
  if (value && value.ShapedBodyDescriptor) {
    return value.ShapedBodyDescriptor;
  }
  return {};
}

function makeYellow(string: string): string {
  return colors.yellow(string);
}

function makeRed(string: string): string {
  return colors.red(string);
}
