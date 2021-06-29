import { Command } from '@oclif/command';
import { LocalCliTaskFlags } from './local-cli-task-runner';
import {
  cleanupAndExit,
  developerDebugLogger,
  loadPathsAndConfig,
} from '@useoptic/cli-shared';
import { getSpecEventsFrom } from '@useoptic/cli-config/build/helpers/read-specification-json';
import * as uuid from 'uuid';
import { getCaptureId } from './git/git-context-capture';
import { CaptureSaverWithDiffs } from '@useoptic/cli-shared/build/captures/avro/file-system/capture-saver-with-diffs';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from './paths';
import { Config } from '../config';
import { EventEmitter } from 'events';
import { IngestTrafficService } from '@useoptic/cli-shared/build/ingest/ingest-traffic-service';
import colors from 'colors';
import { spawnProcessReturnExitCode } from './spawn-process';
import { computeCoverage, printCoverage } from './coverage';
import { ExecVerboseLogger } from './verbose/verbose';
import { IHttpInteraction } from '@useoptic/optic-domain';

export async function ingestOnlyTaskRunner(
  cli: Command,
  command: string,
  flags: LocalCliTaskFlags
) {
  const { paths, config } = await loadPathsAndConfig(cli);

  if (flags['ci']) {
    flags['print-coverage'] = true;
    flags['pass-exit-code'] = true;
    flags['collect-diffs'] = true;
  }

  const usesTaskSpecificBoundary = flags['ci'] || flags['exit-on-diff'];

  await getSpecEventsFrom(paths.specStorePath);

  const captureId = usesTaskSpecificBoundary
    ? uuid.v4()
    : await getCaptureId(paths);

  const daemonState = await ensureDaemonStarted(
    lockFilePath,
    Config.apiBaseUrl
  );

  const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
  developerDebugLogger(`api base url: ${apiBaseUrl}`);
  const cliClient = new Client(apiBaseUrl);

  ////////////////////////////////////////////////////////////////////////////////
  developerDebugLogger('finding matching daemon session');

  const cliSession = await cliClient.findSession(paths.cwd, null, captureId);

  const eventEmitter = new EventEmitter();
  const specServiceClient = new SpecServiceClient(
    cliSession.session.id,
    eventEmitter,
    apiBaseUrl
  );

  const persistenceManager = new CaptureSaverWithDiffs(
    {
      captureBaseDirectory: paths.capturesPath,
      captureId,
      shouldCollectDiffs: true,
    },
    config,
    specServiceClient
  );

  await persistenceManager.init();

  const logger = new ExecVerboseLogger(flags.verbose || false);

  const collectionService = new IngestTrafficService(
    persistenceManager,
    (sample: IHttpInteraction) => logger.sample(sample)
  );

  const loggingUrl = await collectionService.start();

  const env: any = {
    OPTIC_LOGGING_URL: loggingUrl,
  };

  logger.starting(command, loggingUrl);

  console.log(`Running command: ${colors.grey(command)} `);
  console.log(`Traffic can be sent to: ${colors.grey(loggingUrl)} `);

  let exitedByUser = false;
  async function finish(statusCode: number) {
    //stop server, no new batches
    await collectionService.stop();
    //await all pending / unsaved traffic
    await persistenceManager.cleanup();
    // mark capture as complete
    await cliClient.markCaptureAsCompleted(cliSession.session.id, captureId);

    if (flags['print-coverage']) {
      const diff_maps = await computeCoverage(paths, captureId);
      await printCoverage(paths, diff_maps.with_diffs, diff_maps.without_diffs);
    }

    // impliment exit on diff

    logger.results();

    cleanupAndExit(statusCode);
  }

  process.on('SIGINT', function () {
    exitedByUser = true;
    finish(0);
  });

  const exitCode = await spawnProcessReturnExitCode(command, env);

  if (!exitedByUser) {
    finish(exitCode);
  }
}
