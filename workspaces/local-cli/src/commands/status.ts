import { Command, flags } from '@oclif/command';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
//@ts-ignore
import groupBy from 'lodash.groupby';
//@ts-ignore
import padLeft from 'pad-left';
import {
  cleanupAndExit,
  developerDebugLogger,
  fromOptic,
  makeUiBaseUrl,
  userDebugLogger,
} from '@useoptic/cli-shared';
import { Client } from '@useoptic/cli-client';
import {
  getPathsRelativeToConfig,
  IApiCliConfig,
  IPathMapping,
  readApiConfig,
} from '@useoptic/cli-config';
import { getCaptureId, isInRepo } from '../shared/git/git-context-capture';
import colors from 'colors';
import { trackUserEvent } from '../shared/analytics';
import { IDiff } from '@useoptic/cli-shared/build/diffs/diffs';
import { IInteractionTrail } from '@useoptic/cli-shared/build/diffs/interaction-trail';
import { IRequestSpecTrail } from '@useoptic/cli-shared/build/diffs/request-spec-trail';
import {
  IRequestBodyForTrailParser,
  IResponseBodyForTrailParser,
} from '@useoptic/cli-shared/src/diffs/trail-parsers';
import sortBy from 'lodash.sortby';
import openBrowser from 'react-dev-utils/openBrowser';
import { linkToCapture } from '../shared/ui-links';
import {
  LocalCliCapturesService,
  LocalCliSpectacle,
} from '@useoptic/spectacle-shared';
import * as opticEngine from '@useoptic/optic-engine-wasm';
import { locationForTrails } from '@useoptic/cli-shared/build/diffs/trail-parsers';
import { IUnrecognizedUrl } from '@useoptic/spectacle';
import { StatusRun } from '@useoptic/analytics';
import { cli } from 'cli-ux';
import { computeCoverage, printCoverage } from '../shared/coverage';

export default class Status extends Command {
  static description = 'lists API diffs observed since your last git commit';

  static flags = {
    'pre-commit': flags.boolean(),
    'print-coverage': flags.boolean(),
    review: flags.boolean(),
  };

  async run() {
    const { flags } = this.parse(Status);

    const timeStated = Date.now();

    const exitOnDiff = Boolean(flags['pre-commit']);
    const openReviewPage = Boolean(flags['review']);
    const shoultPrintCoverage = Boolean(flags['print-coverage']);

    let { paths, config } = (await this.requiresSpec())!;

    await this.requiresInGit(paths.basePath);

    const captureId = await getCaptureId(paths);
    developerDebugLogger('using capture id ', captureId);

    if (openReviewPage) {
      return this.openDiffPage(paths.cwd, captureId);
    }

    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);

    const cliSession = await cliClient.findSession(paths.cwd, null, null);

    const sessionApiBaseUrl = `http://localhost:${daemonState.port}/api/specs/${cliSession.session.id}`;
    const spectacle = new LocalCliSpectacle(sessionApiBaseUrl, opticEngine);
    const capturesService = new LocalCliCapturesService({
      baseUrl: sessionApiBaseUrl,
      spectacle,
    });

    cli.action.start('Computing API diffs');

    let diffService;

    try {
      const startDiffResult = await capturesService.startDiff(
        'status1', // some random ID
        captureId
      );

      diffService = await startDiffResult.onComplete;
    } catch (error) {
      console.error(
        colors.red('Encountered errors computing diffs:') + `\n${error.message}`
      );
      process.exit(1);
    }

    cli.action.stop('Done!');

    const { diffs } = await diffService.listDiffs();
    const { urls } = await diffService.listUnrecognizedUrls();

    const requests: any = await spectacle.query({
      query: `{
        requests {
          id
          pathId
          method
          absolutePathPatternWithParameterNames
          bodies {
            contentType
            rootShapeId
          }
          responses {
            id
            statusCode
            bodies {
              contentType
              rootShapeId
            }
          }
        }
      }`,
      variables: {},
    });

    const endpoints: Endpoint[] = [];
    const requestBodies: IRequestBodyForTrailParser[] = [];
    const responseBodies: IResponseBodyForTrailParser[] = [];

    for (const request of requests.data.requests) {
      endpoints.push({
        pathId: request.pathId,
        method: request.method,
        fullPath: request.absolutePathPatternWithParameterNames,
      });

      for (const requestBody of request.bodies) {
        requestBodies.push({
          requestId: request.id,
          pathId: request.pathId,
          method: request.method,
          contentType: requestBody.contentType,
          rootShapeId: requestBody.rootShapeId,
        });
      }

      for (const response of request.responses) {
        for (const responseBody of response.bodies) {
          responseBodies.push({
            responseId: response.id,
            pathId: request.pathId,
            method: request.method,
            contentType: responseBody.contentType,
            rootShapeId: responseBody.rootShapeId,
            statusCode: response.statusCode,
          });
        }
      }
    }

    const locations = diffs
      .map((i) => {
        const diff = i[0];
        const location = locationForTrails(
          extractRequestsTrail(diff),
          extractInteractionTrail(diff),
          requestBodies,
          responseBodies
        );
        if (location) {
          return { pathId: location.pathId, method: location.method, diff };
        }
      })
      .filter((i) => Boolean(i));

    const diffsGroupedByPathIdAndMethod = groupBy(
      locations,
      (i: any) => `${i.method}.${i.pathId}`
    );

    const endpointsWithDiff = endpoints.filter((i) =>
      locations.find(
        (withDiff) =>
          withDiff?.pathId === i.pathId && withDiff.method === i.method
      )
    );

    this.printStatus(endpointsWithDiff, diffsGroupedByPathIdAndMethod, urls);

    if (shoultPrintCoverage) {
      const coverage = await computeCoverage(paths, captureId);
      await printCoverage(paths, coverage.with_diffs, coverage.without_diffs);
    }

    await trackUserEvent(
      config.name,
      StatusRun({
        captureId,
        diffCount: diffs.length,
        undocumentedCount: urls.length,
        timeMs: Date.now() - timeStated,
      })
    );

    const diffFound = diffs.length > 0 || urls.length > 0;

    if (diffFound && exitOnDiff) {
      console.error(
        colors.red('Optic detected an API diff. Run "api status --review"')
      );
      process.exit(1);
    }
    cleanupAndExit();
  }

  async exitWithError(error: string) {
    this.log(fromOptic(error));
    process.exit(0);
  }

  async requiresInGit(basepath: string) {
    if (isInRepo(basepath)) {
      return;
    } else {
      await this.exitWithError(
        `"${colors.bold('api status')}" only works when Optic is in a Git repo`
      );
    }
  }

  async requiresSpec(): Promise<
    | {
        paths: IPathMapping;
        config: IApiCliConfig;
      }
    | undefined
  > {
    let paths: IPathMapping;
    let config: IApiCliConfig;

    try {
      paths = await getPathsRelativeToConfig();
      config = await readApiConfig(paths.configPath);
      return { paths, config };
    } catch (e) {
      userDebugLogger(e);
      await this.exitWithError(
        `No optic.yml file found here. Add Optic to your API by running ${colors.bold(
          'api init'
        )}`
      );
    }
  }

  private printStatus(
    endpointsWithDiffs: Endpoint[],
    diffsGroupedByPathAndMethod: { [key: string]: any[] },
    undocumentedUrls: IUnrecognizedUrl[]
  ) {
    const diffCount = (i: Endpoint) =>
      (diffsGroupedByPathAndMethod[`${i.method}.${i.pathId}`] || []).length;

    const sorted = sortBy(endpointsWithDiffs, (i) => -diffCount(i));
    const changed = sorted.map((i) =>
      colors.yellow(generateEndpointString(i.method, i.fullPath))
    );

    if (changed.length === 0) {
      this.log(`✓  No diffs observed for existing endpoints`);
    } else {
      this.log(colors.bold(`   Diffs observed for existing endpoints`));
      this.log(
        colors.grey(
          `     (use ${colors.bold(
            '"api status --review"'
          )} to review in the UI`
        )
      );
      this.log(changed.join('\n'));
    }

    const ordered = sortBy(undocumentedUrls, ['count', 'path']).reverse();

    const onlyShow = 15;
    const newUrls = ordered
      .slice(0, onlyShow)
      .map((i) => colors.green(generateEndpointString(i.method, i.path)));

    if (ordered.length === 0) {
      this.log(`✓  No undocumented URLs observed`);
    } else {
      this.log(colors.bold(`   Undocumented URLs observed`));
      this.log(
        colors.grey(
          `      (use ${colors.bold(
            '"api status --review"'
          )} to start documenting them`
        )
      );
      this.log(newUrls.join('\n'));
      if (ordered.length > onlyShow) {
        this.log(`   and ${ordered.length - onlyShow} more...`);
      }
    }
  }

  async openDiffPage(basePath: string, captureId: string) {
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(basePath, null, null);
    developerDebugLogger({ cliSession });
    const uiBaseUrl = makeUiBaseUrl(daemonState);
    openBrowser(linkToCapture(uiBaseUrl, cliSession.session.id, captureId));
    cleanupAndExit();
  }
}

function generateEndpointString(method: string, fullPath: string) {
  return `${colors.bold(padLeft(method, 13, ' '))}   ${fullPath}`;
}

function extractInteractionTrail(i: IDiff): IInteractionTrail {
  const kind: string = Object.keys(i)[0];
  // @ts-ignore
  return i[kind]!.interactionTrail;
}
function extractRequestsTrail(i: IDiff): IRequestSpecTrail {
  const kind: string = Object.keys(i)[0];
  // @ts-ignore
  return i[kind]!.requestsTrail;
}

type Endpoint = {
  pathId: string;
  method: string;
  fullPath: string;
};
