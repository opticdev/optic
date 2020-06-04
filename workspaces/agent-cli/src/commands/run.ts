import { Command, flags } from '@oclif/command';
import {
  fromOptic,
  ICaptureSaver,
  SaasCaptureSaver,
} from '@useoptic/cli-shared';
import { Config } from '../config';
//@ts-ignore
import jwtDecode from 'jwt-decode';
import * as uuid from 'uuid';
import { CliTaskSession } from '@useoptic/cli-shared/build/tasks';
import { IApiCliConfig } from '@useoptic/cli-config';
import { AgentCliTaskRunner } from '../task-runner';
import { ICreateCaptureResponse } from '@useoptic/saas-types';
import { IHttpInteraction } from '@useoptic/domain-types';

export default class Run extends Command {
  static description = 'start your API process with Optic monitoring';

  static flags = {
    command: flags.string({
      required: true,
      description: 'the command to start your API',
    }),
    listen: flags.string({
      required: true,
      description: 'host:port Optic should start on',
    }),
    config: flags.string({
      required: true,
      description: 'the output from optic-ci capture:start',
    }),
  };

  parseConfig():
    | {
        orgId: string;
        agentGroupId: string;
        captureId: string;
        agentToken: any;
      }
    | undefined {
    let createCaptureConfig: ICreateCaptureResponse | undefined = undefined;
    const { flags } = this.parse(Run);
    try {
      createCaptureConfig = JSON.parse(flags.config);
    } catch (e) {
      this.error(
        fromOptic(`Unable to parse capture config: "${flags.config}"`)
      );
      this.error(e);
    }

    let opticContext:
      | {
          orgId: string;
          agentGroupId: string;
          captureId: string;
        }
      | undefined = undefined;
    let agentToken: string | undefined = undefined;

    if (createCaptureConfig && createCaptureConfig!.agentToken) {
      try {
        agentToken = createCaptureConfig!.agentToken!;
        const decodedToken = jwtDecode(agentToken);
        opticContext = decodedToken.opticContext;
      } catch (e) {
        this.error(
          fromOptic(
            `Invalid monitoring config token provided. Please try another`
          )
        );
        this.error(e);
      }
    }

    if (opticContext) {
      return {
        orgId: opticContext!.orgId,
        agentGroupId: opticContext!.agentGroupId,
        captureId: opticContext!.captureId,
        agentToken,
      };
    }
  }

  async run() {
    const { flags } = this.parse(Run);
    const opticConfig = {
      ignoreRequests: undefined,
    };

    const identifiers = this.parseConfig();

    //Optic has valid config
    if (identifiers) {
      this.log(fromOptic('Starting your API with Optic monitoring...'));
      const agentId = uuid.v4();
      const persistenceManager = new SaasCaptureSaver({
        orgId: identifiers!.orgId,
        agentGroupId: identifiers!.agentGroupId,
        agentId,
        baseUrl: Config.apiBaseUrl,
        launchTokenString: identifiers!.agentToken,
        captureId: identifiers!.captureId,
      });

      const runner = new AgentCliTaskRunner(persistenceManager);
      const cliTaskSession = new CliTaskSession(runner);
      const config: IApiCliConfig = {
        name: '',
        ignoreRequests: opticConfig.ignoreRequests,
        tasks: {
          start: {
            command: flags.command,
            baseUrl: flags.listen,
          },
        },
      };
      await cliTaskSession.start(this, config, 'start');
    } else {
      this.log(
        fromOptic(
          'A valid Optic monitoring token was not provided. Starting your API normally'
        )
      );

      class DoNothingCapture implements ICaptureSaver {
        cleanup(): Promise<void> {
          return Promise.resolve(undefined);
        }

        init(): Promise<void> {
          return Promise.resolve(undefined);
        }

        save(sample: IHttpInteraction): Promise<void> {
          return Promise.resolve(undefined);
        }
      }

      const runner = new AgentCliTaskRunner(new DoNothingCapture());
      const cliTaskSession = new CliTaskSession(runner);
      const config: IApiCliConfig = {
        name: '',
        ignoreRequests: opticConfig.ignoreRequests,
        tasks: {
          start: {
            command: flags.command,
            baseUrl: flags.listen,
          },
        },
      };
      await cliTaskSession.start(this, config, 'start');
    }
  }
}
