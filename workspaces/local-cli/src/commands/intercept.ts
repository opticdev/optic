import { Command, flags } from '@oclif/command';
import {
  cleanupAndExit,
  CommandAndProxySessionManager,
  developerDebugLogger,
  fromOptic,
  loadPathsAndConfig,
  makeUiBaseUrl,
} from '@useoptic/cli-shared';
import colors from 'colors';
import { getCaptureId } from '../shared/git/git-context-capture';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import { CaptureSaverWithDiffs } from '@useoptic/cli-shared/build/captures/avro/file-system/capture-saver-with-diffs';
import { EventEmitter } from 'events';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import getPort from 'get-port';
import url from 'url';
import { BrowserLaunchers } from '../shared/intercept/browser-launchers';
import { cli } from 'cli-ux';
import openBrowser from 'react-dev-utils/openBrowser';
import { IHttpInteraction } from '@useoptic/cli-shared/build/optic-types';

export default class Intercept extends Command {
  static description =
    'intercept API traffic for a given hostname ie api.example.com';

  static flags = {
    chrome: flags.boolean({
      description:
        'collect traffic to your deployed environment using Chrome network tab',
    }),
  };

  static args = [
    {
      name: 'environment',
      required: true,
    },
  ];

  async run() {
    const cwd = process.cwd();

    const { args, flags } = this.parse(Intercept);

    const { paths, config } = await loadPathsAndConfig(this);
    const environments = config.environments || {};

    if (!environments[args.environment]) {
      return this.warn(
        `No environment ${args.environment} found in optic.yml.Set one up like this:\n${exampleenv}`
      );
    }

    const envToTarget = environments[args.environment]!;

    const captureId = await getCaptureId(paths);
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );

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

    let browsers: BrowserLaunchers | undefined = undefined;

    const onStarted = (fingerprint: string) => {
      browsers = new BrowserLaunchers(
        `${proxyConfig.protocol}//${proxyConfig.host}:${proxyConfig.port}`,
        envToTarget.webUI || envToTarget.host,
        fingerprint,
        this
      );

      if (flags.chrome) browsers.chrome();
    };

    let collected = 0;
    cli.action.start('Waiting for traffic...');
    cli.action.type = 'debug';
    const onSample = (sample: IHttpInteraction) => {
      collected++;
      cli.action.start(
        `Waiting for traffic...`,
        `${colors.gray(`${collected} requests collected`)}\n${
          sample.request.method
        } ${sample.request.host}${sample.request.path} | ${
          sample.response.statusCode
        }`
      );
    };

    const sessionManager = new CommandAndProxySessionManager(
      {
        hostnameFilter: `${serviceConfig.host}`,
        serviceConfig: serviceConfig,
        proxyConfig: proxyConfig,
      },
      onStarted,
      onSample
    );

    console.log(
      fromOptic(
        `Transparent proxy is running on ${serviceConfig.protocol}//localhost:${transparentProxyPort}\nMonitoring Traffic to ${envToTarget.host}`
      )
    );

    await sessionManager.run(persistenceManager);
    if (browsers) {
      browsers!.cleanup();
    }
    const uiBaseUrl = makeUiBaseUrl(daemonState);
    const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/review/${captureId}`;
    openBrowser(uiUrl);

    cleanupAndExit(0);
  }
}

const exampleenv = `
environments:
  production:
    host: https://api.github.com # the hostname of the API we should record traffic from
    webUI: https://github.com # the url that should open when a browser flag is passed\`
`;
