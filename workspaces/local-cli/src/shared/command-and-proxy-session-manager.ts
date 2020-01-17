import {IOpticTaskRunnerConfig} from '@useoptic/cli-config';
import {ICaptureSaver} from '@useoptic/cli-server';
import {HttpToolkitCapturingProxy} from '@useoptic/proxy';
import {IApiInteraction} from '@useoptic/proxy';
import {CommandSession} from './command-session';
import {userDebugLogger} from './logger';

class CommandAndProxySessionManager {
  constructor(private config: IOpticTaskRunnerConfig) {

  }

  async run(persistenceManager: ICaptureSaver) {
    const commandSession = new CommandSession();
    const inboundProxy = new HttpToolkitCapturingProxy();
    const inboundProxyPort = this.config.proxyConfig.port;
    const inputs = {
      ENV: {
        OPTIC_API_PORT: inboundProxyPort.toString()
      }
    };

    await persistenceManager.init(this.config.captureId);

    inboundProxy.events.on('sample', (sample: IApiInteraction) => {
      userDebugLogger(`got sample ${sample.request.method} ${sample.request.url}`);
      persistenceManager.save(sample);
    });

    await inboundProxy.start({
      flags: {
        chrome: false
      },
      //@TODO: add proxyTarget here if not intercepting everything
      proxyPort: inboundProxyPort
    });

    userDebugLogger(`started inbound proxy on port ${inboundProxyPort}`);
    const promises = [];
    if (this.config.command) {
      await commandSession.start({
        command: this.config.command,
        environmentVariables: {
          ...process.env,
          OPTIC_API_PORT: inputs.ENV.OPTIC_API_PORT,
        }
      });
      const commandStoppedPromise = new Promise(resolve => {
        commandSession.events.on('stopped', () => resolve());
      });
      promises.push(commandStoppedPromise);
    }

    const processInterruptedPromise = new Promise((resolve) => {
      process.on('SIGINT', () => {
        resolve();
      });
    });
    promises.push(processInterruptedPromise);

    await Promise.race(promises);

    commandSession.stop();
    await Promise.all(promises);
    await inboundProxy.stop();
  }
}

export {
  CommandAndProxySessionManager
};
