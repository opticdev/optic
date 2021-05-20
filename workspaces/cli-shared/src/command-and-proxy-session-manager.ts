import { IOpticTaskRunnerConfig, Modes } from '@useoptic/cli-config';
import { CommandSession } from './command-session';
import { HttpToolkitCapturingProxy } from './httptoolkit-capturing-proxy';
import {
  developerDebugLogger,
  ICaptureSaver,
  userDebugLogger,
  fromOptic,
} from './index';
import url from 'url';
import { buildQueryStringParser } from './query/build-query-string-parser';
import { awaitTaskUp } from './tasks/await-up';
import { IHttpInteraction } from './optic-types';

class CommandAndProxySessionManager {
  constructor(
    private config: IOpticTaskRunnerConfig,
    private onStarted?: (fingerPrint: string) => void,
    private onSample?: (sample: IHttpInteraction) => void
) {}

  private commandSession: CommandSession | undefined;

  public getExitCodeOfProcess(): number | undefined {
    if (this.commandSession) {
      return this.commandSession?.exitCode || undefined;
    }
  }

  async run(persistenceManager: ICaptureSaver) {
    this.commandSession = new CommandSession();
    const commandSession = this.commandSession!;
    const inboundProxy = new HttpToolkitCapturingProxy();
    const servicePort = this.config.serviceConfig.port;
    const serviceHost = this.config.serviceConfig.host;
    const opticServiceConfig = {
      PORT: servicePort.toString(),
      OPTIC_API_PORT: servicePort.toString(), // backwards compatible
      OPTIC_API_HOST: serviceHost.toString(),
      OPTIC_PROXY_PORT: this.config.proxyConfig.port.toString(),
    };

    await persistenceManager.init();

    inboundProxy.events.on('sample', (sample: IHttpInteraction) => {
      userDebugLogger(
        `attempting to save sample ${sample.request.method} ${sample.request.path}`
      );
      persistenceManager.save(sample);
      if (this.onSample) {
        this.onSample(sample)
      }
    });

    const target = url.format({
      hostname: serviceHost,
      port: servicePort,
      protocol: this.config.serviceConfig.protocol,
    });
    developerDebugLogger({ target });
    await inboundProxy.start({
      flags: {
        includeTextBody: process.env.OPTIC_ENABLE_CAPTURE_BODY === 'yes',
        includeJsonBody: process.env.OPTIC_ENABLE_CAPTURE_BODY === 'yes',
        includeShapeHash: true,
        includeQueryString: true,
      },
      host: this.config.proxyConfig.host,
      hostnameFilter:
        process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes'
          ? this.config.hostnameFilter
          : undefined,
      proxyTarget:
        process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes'
          ? undefined
          : target,
      proxyPort: this.config.proxyConfig.port,
      queryParser: buildQueryStringParser(),
    });

    userDebugLogger(
      `started inbound proxy on port ${this.config.proxyConfig.port}`
    );

    userDebugLogger(
      `All traffic should go through the inbound proxy on port ${this.config.proxyConfig.port} and it will be forwarded to ${this.config.serviceConfig.host}:${this.config.serviceConfig.port}.`
    );

    console.log(
      fromOptic(
        `Optic is observing requests made to ${this.config.proxyConfig.protocol}//${this.config.proxyConfig.host}:${this.config.proxyConfig.port}`
      )
    );

    const promises = [];
    developerDebugLogger(this.config);
    if (this.config.command) {
      userDebugLogger(
        `Your command will be run with environment variable OPTIC_API_PORT=${servicePort}.`
      );
      userDebugLogger(`running command ${this.config.command}`);
      await commandSession.start({
        command: this.config.command,
        environmentVariables: {
          ...process.env,
          ...opticServiceConfig,
        },
      });

      if (this.onStarted) {
        // run test task for manual mode
        await awaitTaskUp(Modes.Recommended, this.config);
        await this.onStarted(inboundProxy.fingerprint!);
        await commandSession.stop();
      }

      const commandStoppedPromise = new Promise((resolve) => {
        commandSession.events.on('stopped', ({ state }) => {
          developerDebugLogger(`command session stopped (${state})`);
          resolve();
        });
      });
      promises.push(commandStoppedPromise);
    } else {
      if (this.onStarted) {
        await awaitTaskUp(Modes.Manual, this.config);
        await this.onStarted(inboundProxy.fingerprint!);
      }
    }

    const processInterruptedPromise = new Promise((resolve) => {
      process.on('SIGINT', () => {
        resolve();
      });
    });
    promises.push(processInterruptedPromise);

    developerDebugLogger(`waiting for command to complete or ^C...`);
    await Promise.race(promises);
    commandSession.stop();
    developerDebugLogger(`done waiting for command to complete or ^C`);
    developerDebugLogger(`waiting for proxy to stop...`);
    await inboundProxy.stop();
    developerDebugLogger(`done waiting for proxy to stop`);
    developerDebugLogger(`waiting for persistence manager to stop...`);
    await persistenceManager.cleanup();
    developerDebugLogger(`done waiting for persistence manager to stop`);
  }
}

export { CommandAndProxySessionManager };
