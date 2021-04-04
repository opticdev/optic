import { Command, flags } from '@oclif/command';
import {
  cleanupAndExit,
  CommandAndProxySessionManager,
  developerDebugLogger,
  fromOptic,
  loadPathsAndConfig,
} from '@useoptic/cli-shared';
import * as uuid from 'uuid';
import { getCaptureId } from '../shared/git/git-context-capture';
import { LocalCliTaskRunner } from '../shared/local-cli-task-runner';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import { CaptureSaverWithDiffs } from '@useoptic/cli-shared/build/captures/avro/file-system/capture-saver-with-diffs';
import { EventEmitter } from 'events';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import getPort from 'get-port';
import url from 'url';
import { BrowserLaunchers } from '../shared/intercept/browser-launchers';

export default class Intercept extends Command {
  static description =
    'intercept API traffic for a given hostname ie api.example.com';

  static flags = {
    chrome: flags.boolean({}),
    postman: flags.string({}),
    shell: flags.string({}),
  };

  static args = [
    {
      name: 'environments',
    },
  ];

  async run() {
    const cwd = process.cwd();

    const { args } = this.parse(Intercept);

    const resolved: IEnvironmentsConfig = {
      production: {
        host: 'https://api.github.com',
        webUI: 'https://api.github.com/orgs/opticdev',
      },
    };

    const envToTarget = resolved[args.environments];

    const { paths, config } = await loadPathsAndConfig(this);

    const captureId = await getCaptureId(paths);
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );

    console.log(captureId);

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(cwd, null, captureId);
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
        shouldCollectCoverage: false,
        shouldCollectDiffs: false,
      },
      config,
      specServiceClient
    );

    process.env.OPTIC_ENABLE_CAPTURE_BODY = 'yes';
    process.env.OPTIC_ENABLE_TRANSPARENT_PROXY = 'yes';

    const transparentProxyPort: number = await getPort({
      port: getPort.makeRange(3700, 3900),
    });

    const parsedTarget = url.parse(envToTarget.host);
    const serviceProtocol = parsedTarget.protocol || 'https:';

    const serviceConfig = {
      port:
        serviceProtocol === 'http:' // assume standard ports for targets without explicit ports
          ? 80
          : 443,
      host: parsedTarget.hostname!,
      protocol: serviceProtocol,
      basePath: '/',
    };

    const proxyConfig = {
      port: transparentProxyPort,
      host: 'localhost',
      protocol: serviceProtocol,
      basePath: '/',
    };

    const onStarted = (fingerprint: string) => {
      const browsers = new BrowserLaunchers(
        `${proxyConfig.protocol}//${proxyConfig.host}:${proxyConfig.port}`,
        envToTarget.webUI || envToTarget.host,
        fingerprint,
        this
      );
      browsers.chrome();
    };

    const sessionManager = new CommandAndProxySessionManager(
      {
        hostnameFilter: `${serviceConfig.host}`,
        serviceConfig: serviceConfig,
        proxyConfig: proxyConfig,
      },
      onStarted
    );

    console.log(
      fromOptic(
        `Transparent proxy is running on http://localhost:${transparentProxyPort} and https://localhost:${transparentProxyPort}\nMonitoring Traffic to ${envToTarget.host}`
      )
    );

    await sessionManager.run(persistenceManager);
    cleanupAndExit(0);
  }
}

interface IEnvironmentsConfig {
  [key: string]: {
    host: string;
    webUI?: string;
  };
}
