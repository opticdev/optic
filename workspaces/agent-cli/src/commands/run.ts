import { Command, flags } from '@oclif/command';
import { SaasCaptureSaver } from '@useoptic/cli-shared';
import { Config } from '../config';
//@ts-ignore
import jwtDecode from 'jwt-decode';
import * as uuid from 'uuid';
import { CliTaskSession } from '@useoptic/cli-shared/build/tasks';
import { IApiCliConfig } from '@useoptic/cli-config';
import { AgentCliTaskRunner } from '../task-runner';
import { ICreateCaptureResponse } from '@useoptic/saas-types';

export default class Run extends Command {
  static description = 'describe the command here';

  static examples = [`$ optic-agent run ????`];

  static flags = {
    command: flags.string({
      required: true,
      description: 'the command to run',
    }),
    masquerade: flags.string({
      required: true,
      description: 'host:port Optic should start on',
    }),
    config: flags.string({
      required: true,
      description: 'the output from optic-ci capture:start',
    }),
  };

  async run() {
    const { flags } = this.parse(Run);
    const opticConfig = {
      ignoreRequests: undefined,
    };
    const { agentToken }: ICreateCaptureResponse = JSON.parse(flags.config);
    const decodedToken = jwtDecode(agentToken);
    const { opticContext } = decodedToken;
    const { orgId, agentGroupId, captureId } = opticContext;

    const agentId = uuid.v4();

    const persistenceManager = new SaasCaptureSaver({
      orgId,
      agentGroupId,
      agentId,
      baseUrl: Config.apiBaseUrl,
      launchTokenString: agentToken,
      captureId,
    });

    const runner = new AgentCliTaskRunner(persistenceManager);
    const cliTaskSession = new CliTaskSession(runner);
    const config: IApiCliConfig = {
      name: '',
      ignoreRequests: opticConfig.ignoreRequests,
      tasks: {
        start: {
          command: flags.command,
          baseUrl: flags.masquerade,
        },
      },
    };
    await cliTaskSession.start(this, config, 'start');
  }
}
