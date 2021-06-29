import { Command, flags } from '@oclif/command';
// @ts-ignore
import {
  getPathsRelativeToConfig,
  IApiCliConfig,
  IPathMapping,
  readApiConfig,
} from '@useoptic/cli-config';
//@ts-ignore
import niceTry from 'nice-try';
import { cli } from 'cli-ux';
//@ts-ignore
import which from 'which';
import colors from 'colors';
import { IOpticScript } from '@useoptic/cli-config/build';
import {
  developerDebugLogger,
  fromOptic,
  userDebugLogger,
} from '@useoptic/cli-shared';
import { generateOas } from './generate/oas';
import {
  spawnProcess,
  spawnProcessReturnExitCode,
} from '../shared/spawn-process';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import { Client } from '@useoptic/cli-client';
export default class Scripts extends Command {
  static description =
    'run one of the scripts in optic.yml with the current specification';

  static args = [
    {
      name: 'scriptName',
      required: true,
    },
  ];

  static flags = {
    install: flags.boolean({
      required: false,
      char: 'i',
    }),
  };

  async run() {
    const { args, flags } = this.parse(Scripts);
    const scriptName: string = args.scriptName;

    const script: IOpticScript | undefined = await niceTry(async () => {
      const paths = await getPathsRelativeToConfig();
      const config = await readApiConfig(paths.configPath);
      const foundScript = config.scripts?.[scriptName!];
      if (foundScript) {
        return normalizeScript(foundScript);
      } else {
        cli.log(
          fromOptic(
            `Script ${colors.grey.bold(
              scriptName
            )} does not exist. Try one of these ${colors.grey.bold(
              'api scripts <scriptname>'
            )}`
          )
        );
        return cli.log(
          Object.keys(config.scripts || [])
            .map((i) => '- ' + i)
            .sort()
            .join('\n')
        );
      }
    });

    if (scriptName && script) {
      this.log(fromOptic(`Found Script ${colors.bold(scriptName)}`));
      const { found, missing } = await checkDependencies(script);
      if (missing.length) {
        const hasInstallScript = Boolean(script.install);
        this.log(
          fromOptic(
            colors.red(
              `Some bin dependencies are missing ${JSON.stringify(missing)}. ${
                hasInstallScript &&
                !flags.install &&
                "Run the command again with the flag '--install' to install them"
              }`
            )
          )
        );
        if (hasInstallScript && flags.install) {
          const result = await tryInstall(script.install!);
          if (!result) {
            return this.log(
              fromOptic(
                colors.red(
                  'Install command failed. Please install the dependencies for this script manually'
                )
              )
            );
          } else {
            return this.executeScript(script);
          }
        }
        return;
      } else {
        return this.executeScript(script);
      }
    } else {
      this.log(
        fromOptic(colors.red(`No script ${scriptName} found in optic.yml`))
      );
    }
  }

  async executeScript(script: IOpticScript) {
    const oasPaths: any = await generateOas(true, true)!;
    let { paths } = (await this.requiresSpec())!;
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );
    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(paths.cwd, null, null);
    const spectacleUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/spectacle`;

    const env: any = {
      OPENAPI_JSON: oasPaths.json,
      OPENAPI_YAML: oasPaths.yaml,
      SPECTACLE_URL: spectacleUrl,
    };

    console.log(`Running command: ${colors.grey(script.command)} `);
    const exitStatus = await spawnProcessReturnExitCode(script.command, env);
    process.exit(exitStatus);
  }

  // TODO: this is copy/pasted from commands/status.ts
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

  // TODO: this is copy/pasted from commands/status.ts
  async exitWithError(error: string) {
    this.log(fromOptic(error));
    process.exit(0);
  }
}

function normalizeScript(scriptRaw: string | IOpticScript): IOpticScript {
  if (typeof scriptRaw === 'string') {
    return {
      command: scriptRaw,
      dependsOn: [],
    };
  } else {
    const dependsOn =
      (scriptRaw.dependsOn && typeof scriptRaw.dependsOn === 'string'
        ? [scriptRaw.dependsOn]
        : scriptRaw.dependsOn) || [];
    return { ...scriptRaw, dependsOn };
  }
}

async function checkDependencies(
  script: IOpticScript
): Promise<{ found: string[]; missing: string[] }> {
  const dependencies = script.dependsOn as Array<string>;
  cli.action.start(
    `${colors.bold(`Checking bin dependencies`)} ${colors.grey(
      'Requiring ' + JSON.stringify(dependencies)
    )}`
  );

  const results: [string, string][] = [];
  for (const bin of dependencies) {
    const pathToBin = which.sync(bin, { nothrow: true });
    results.push([bin, pathToBin]);
  }

  const found = results.filter((i) => Boolean(i[1])).map((i) => i[0]);
  const missing = results.filter((i) => !Boolean(i[1])).map((i) => i[0]);

  if (missing.length === 0) {
    cli.action.stop(colors.green.bold('✓ All dependencies found'));
  } else {
    cli.action.stop(colors.red('Missing dependencies'));
  }

  return { found, missing };
}

async function tryInstall(installScript: string): Promise<boolean> {
  cli.action.start(`Running install command: ${colors.grey(installScript)} `);
  const status = await spawnProcess(installScript);
  cli.action.stop('Success!');
  return status;
}
