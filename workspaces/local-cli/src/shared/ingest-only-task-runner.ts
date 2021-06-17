import { Command } from '@oclif/command';
import { LocalCliTaskFlags } from './local-cli-task-runner';
import { developerDebugLogger, loadPathsAndConfig } from '@useoptic/cli-shared';
import { getSpecEventsFrom } from '@useoptic/cli-config/build/helpers/read-specification-json';
import * as uuid from 'uuid';
import { getCaptureId } from './git/git-context-capture';
import { CaptureSaverWithDiffs } from '@useoptic/cli-shared/build/captures/avro/file-system/capture-saver-with-diffs';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from './paths';
import { Config } from '../config';
import { EventEmitter } from 'events';

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
}
