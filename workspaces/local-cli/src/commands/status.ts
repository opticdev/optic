import { Command, flags } from '@oclif/command';
//@ts-ignore
import gitRev from '../shared/git/git-rev-sync-insourced.js';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import groupBy from 'lodash.groupby';
import EventSource from 'eventsource';
import padLeft from 'pad-left';
import {
  cleanupAndExit,
  developerDebugLogger,
  fromOptic,
  userDebugLogger,
} from '@useoptic/cli-shared';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
//@ts-ignore
import { isInRepo } from '../shared/git/git-rev-sync-insourced';
import { EventEmitter } from 'events';
import {
  getPathsRelativeToConfig,
  IApiCliConfig,
  IPathMapping,
  readApiConfig,
} from '@useoptic/cli-config';
import { getCaptureId } from '../shared/git/git-context-capture';
import fs from 'fs-extra';
import { IgnoreFileHelper } from '@useoptic/cli-config/build/helpers/ignore-file-interface';
import { JsonHttpClient } from '@useoptic/client-utilities';
import colors from 'colors';
import { getUser } from '../shared/analytics';
import openBrowser from 'react-dev-utils/openBrowser';
import { cli } from 'cli-ux';
import { diff } from 'semver';
import { makeDiffRfcBaseStateFromEvents } from '@useoptic/cli-shared/build/diffs/diff-rfc-base-state';
import { IDiff } from '@useoptic/cli-shared/build/diffs/diffs';
import { locationForTrails } from '@useoptic/cli-shared/build/diffs/trail-parsers';
import { IInteractionTrail } from '@useoptic/cli-shared/build/diffs/interaction-trail';
import { IRequestSpecTrail } from '@useoptic/cli-shared/build/diffs/request-spec-trail';
import { universeFromEvents } from '@useoptic/domain-utilities';
import { Queries } from '@useoptic/domain';
import sortBy from 'lodash.sortby';
import {
  createEndpointDescriptor,
  getCachedQueryResults,
  KnownEndpoint,
} from '../shared/coverage';

export default class Status extends Command {
  static description = 'lists API diffs observed since your last git commit';
  async run() {
    await this.requiresInGit();
    let { paths, config } = (await this.requiresSpec())!;

    const captureId = getCaptureId(paths);

    const diffsPromise = this.getDiffsAndEvents(paths, captureId, config);

    diffsPromise.then(({ diffs, undocumentedUrls, events }) => {
      const rfcBaseState = makeDiffRfcBaseStateFromEvents(events);
      const diffsRaw: IDiff[] = diffs.map((i: any) => i[0]);

      const locations = diffsRaw
        .map((i) => {
          return locationForTrails(
            extractRequestsTrail(i),
            extractInteractionTrail(i),
            rfcBaseState
          )!;
        })
        .filter(Boolean);

      const diffsGroupedByPathAndMethod = groupBy(
        locations,
        (i: any) => `${i.method}.${i.pathId}`
      );

      const endpointsWithDiffs = getSpecEndpoints(
        rfcBaseState.queries
      ).filter((i) =>
        locations.find(
          (withDiff) =>
            withDiff.pathId === i.pathId && withDiff.method === i.method
        )
      );

      this.printStatus(
        endpointsWithDiffs,
        diffsGroupedByPathAndMethod,
        undocumentedUrls
      );
    });

    diffsPromise.catch(() => {
      cleanupAndExit();
    });
  }

  async exitWithError(error: string) {
    this.log(fromOptic(error));
    process.exit(0);
  }

  async requiresInGit() {
    if (isInRepo()) {
      return;
    } else {
      await this.exitWithError(
        `"${colors.bold('api init')}" only works when Optic is in a Git repo`
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

  async getDiffsAndEvents(
    paths: IPathMapping,
    captureId: string,
    config: IApiCliConfig
  ) {
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    cliClient.setIdentity(await getUser());
    const cliSession = await cliClient.findSession(paths.cwd, null, null);
    developerDebugLogger({ cliSession });

    const eventEmitter = new EventEmitter();
    const specService = new SpecServiceClient(
      cliSession.session.id,
      eventEmitter,
      apiBaseUrl
    );

    const ignoreHelper = new IgnoreFileHelper(
      paths.opticIgnorePath,
      paths.configPath
    );
    const ignoreRules = (await ignoreHelper.getCurrentIgnoreRules()).allRules;
    const events = await fs.readJSON(paths.specStorePath);

    const captureStatus = specService.getCaptureStatus(captureId);

    const startDiffUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/captures/${captureId}/diffs`;

    const { diffId, notificationsUrl } = await JsonHttpClient.postJson(
      startDiffUrl,
      {
        ignoreRules,
        additionalCommands: [],
        events,
        filters: [],
      }
    );

    const getDiffsUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/captures/${captureId}/diffs/${diffId}/diffs`;
    const getUndocumentedUrlsUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/captures/${captureId}/diffs/${diffId}/undocumented-urls`;

    const notificationChannel = new EventSource(
      `http://localhost:${daemonState.port}` + notificationsUrl
    );

    let customBar: any | undefined;
    captureStatus.then(({ interactionsCount }) => {
      customBar = cli.progress({
        format: '{bar} | {value}/{total} diffed',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        clearOnComplete: true,
      });
      customBar.start(interactionsCount, 0);
    });

    await new Promise((resolve, reject) => {
      notificationChannel.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (type === 'message') {
          if (Boolean(customBar)) {
            customBar.update(
              parseInt(data.diffedInteractionsCounter) +
                parseInt(data.skippedInteractionsCounter)
            );
          }
          if (!data.hasMoreInteractions) {
            resolve();
          }
        } else if (type === 'error') {
          reject();
        }
      };
      notificationChannel.onerror = function (err) {
        reject();
      };
    });

    customBar && customBar.stop();
    notificationChannel.close();

    const diffs = await JsonHttpClient.getJson(getDiffsUrl);
    const undocumentedUrls = await JsonHttpClient.getJson(
      getUndocumentedUrlsUrl
    );

    return {
      diffs,
      events,
      undocumentedUrls: undocumentedUrls.urls,
      captureStatus: await captureStatus,
    };
  }

  private printStatus(
    endpointsWithDiffs: KnownEndpoint[],
    diffsGroupedByPathAndMethod: any,
    undocumentedUrls: any[]
  ) {
    const diffCount = (i: KnownEndpoint) =>
      (diffsGroupedByPathAndMethod[`${i.method}.${i.pathId}`] || []).length;

    const sorted = sortBy(endpointsWithDiffs, (i) => -diffCount(i));
    const changed = sorted.map((i) =>
      colors.yellow(generateEndpointString(i.method, i.fullPath))
    );

    this.log('\n');

    if (changed.length === 0) {
      this.log(colors.bold(` ✅  No diffs observed for existing endpoints`));
    } else {
      this.log(colors.bold(` ↘️   Diffs observed for existing endpoints`));
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

    this.log('\n');

    if (ordered.length === 0) {
      this.log(colors.bold(` ✅  No diffs observed for existing endpoints`));
    } else {
      this.log(colors.bold(` ↘️   Diffs observed for existing endpoints`));
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

    this.log('\n');
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

function getSpecEndpoints(queries: any): KnownEndpoint[] {
  const endpoints = queries.endpoints();
  const cachedQueryResults = getCachedQueryResults(queries);
  const allEndpoints = endpoints.map((i: any) => ({
    ...i,
    fullPath: queries.absolutePath(i.pathId),
    descriptor: createEndpointDescriptor(i, cachedQueryResults),
  }));

  return sortBy(allEndpoints, (i) => i.fullPath);
}
