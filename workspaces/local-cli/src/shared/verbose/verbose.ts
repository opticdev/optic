import { LocalCliTaskFlags } from '../local-cli-task-runner';
import colors from 'colors';
import { IOpticTaskRunnerConfig } from '@useoptic/cli-config';
import { fromOpticVerbose } from '@useoptic/cli-shared/build/conversation';
import { IHttpInteraction } from '@useoptic/optic-domain';
import waitOn from 'wait-on';

class VerboseLogger {
  public errors: string[] = [];
  public failed: boolean = false;
  public sampleCount: number = 0;

  constructor(private enabled: boolean) {}

  log(message: string) {
    if (this.enabled) {
      console.log(fromOpticVerbose(message));
    }
  }

  sample(sample: IHttpInteraction) {
    this.log(
      `${colors.grey(`Sample ${this.sampleCount.toString()}`)} ${
        sample.request.method
      } ${sample.request.path} ${colors.bgCyan(`➔`)} ${colors.green(
        sample.response.statusCode.toString()
      )} response`
    );
    this.sampleCount = this.sampleCount + 1;
  }

  logError(message: string) {
    if (this.enabled) {
      this.failed = true;
      this.errors = [...this.errors, message];
      console.log(fromOpticVerbose(`${colors.red(message)}`));
    }
  }
}

export class RunTaskVerboseLogger extends VerboseLogger {
  constructor(
    public enabled: boolean,
    private taskName: string,
    private flags: LocalCliTaskFlags,
    private path: string
  ) {
    super(enabled);
  }

  logConfigMeaning(taskConfig: IOpticTaskRunnerConfig) {
    this.log(
      colors.bgBlue(
        `${colors.bold(this.taskName)} task is running. Explanation:`
      )
    );

    if (taskConfig.command) {
      waitOn({
        resources: [`tcp:${taskConfig.serviceConfig.port}`],
        delay: 0,
        tcpTimeout: 500,
        timeout: 15000,
      })
        .then((e) => {
          this.log(
            `✅ Your API just started on the port Optic assigned it using the env variable ${colors.cyan.bold(
              'PORT'
            )} -> ${colors.cyan.bold(taskConfig.serviceConfig.port.toString())}`
          );
        })
        .catch((e) => {
          this.logError(
            `⚠️  After 15 seconds, Optic never saw your API start on the port it assigns using the ${colors.cyan.bold(
              'PORT'
            )} variable`
          );
        });

      this.log(`Running the command "${colors.cyan.bold(taskConfig.command)}"`);
      this.log(
        `With an env variable called "${colors.cyan.bold(
          'PORT'
        )}" set to "${colors.cyan.bold(
          taskConfig.serviceConfig.port.toString()
        )}"`
      );
      this.log(
        `Expect the Optic proxy to start on "${colors.cyan.bold(
          'localhost:' + taskConfig.proxyConfig.port.toString()
        )}" and route traffic to your API on "${colors.cyan.bold(
          'localhost:' + taskConfig.serviceConfig.port.toString()
        )}"`
      );
    } else {
      this.log(
        `Optic is starting a proxy on ${colors.cyan.bold(
          `http://localhost:${taskConfig.proxyConfig.port}`
        )} also on (https)`
      );
      this.log(
        `The proxy forwards / intercepts traffic to ${colors.cyan.bold(
          `${taskConfig.serviceConfig.protocol}${taskConfig.serviceConfig.host}:${taskConfig.serviceConfig.port}`
        )}`
      );
    }
  }

  portTaken(port: number) {
    this.logError(
      `⚠️   Something is already running on port ${port}. Can not start Optic Proxy there.`
    );
  }

  commandExitCode(code: number) {
    this.log(`Command exited with code ${code}`);
  }

  results(sampleCount: any, foundDiff: boolean) {
    this.log(
      `Task finished with ${colors.cyan(
        sampleCount.toString()
      )} samples in latest capture`
    );
    if (this.failed) {
      this.errors.forEach((i) => this.logError(i));
    }
    if (sampleCount === 0) {
      this.logError(
        'No samples were captured. Make sure your task is set up properly to start your API and the Optic Proxy'
      );
    }
  }
}

export class ExecVerboseLogger extends VerboseLogger {
  constructor(enabled: boolean) {
    super(enabled);
  }

  results() {
    this.log(
      `Task finished with ${colors.cyan(
        this.sampleCount.toString()
      )} samples in latest capture`
    );
  }

  starting(command: string, loggingUrl: string) {
    this.log(
      `Starting a local server that receives traffic sent from your SDK/Middleware to ${colors.cyan.bold(
        loggingUrl
      )} `
    );
    this.log(`Running command ${colors.cyan.bold(command)}`);
  }
}
