import { Command, flags } from '@oclif/command';
// @ts-ignore
import { getPathsRelativeToConfig, readApiConfig } from '@useoptic/cli-config';
//@ts-ignore
import niceTry from 'nice-try';
import { cli } from 'cli-ux';
//@ts-ignore
import which from 'which';
import colors from 'colors';
import { spawn, SpawnOptions } from 'child_process';
import { IOpticScript } from '@useoptic/cli-config/build';
import { fromOptic } from '@useoptic/cli-shared';
import { generateOas } from './generate/oas';
import { spawnProcess } from '../shared/spawn-process';
export default class Scripts extends Command {
  static description = 'Run one of the scripts in your optic.yml file';

  static args = [
    {
      name: 'scriptName',
      required: false,
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
    const scriptName: string | undefined = args.scriptName;

    if (!scriptName) {
      return console.log('list all scripts...');
    }

    const script: IOpticScript | undefined = await niceTry(async () => {
      const paths = await getPathsRelativeToConfig();
      const config = await readApiConfig(paths.configPath);
      const foundScript = config.scripts?.[scriptName!];
      if (foundScript) {
        return normalizeScript(foundScript);
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
    const paths: any = await generateOas(true, true)!;
    const env: any = {
      //@ts-ignore
      OPENAPI_JSON: paths.json,
      //@ts-ignore
      OPENAPI_YAML: paths.yaml,
    };

    console.log(`Running command: ${colors.grey(script.command)} `);
    await spawnProcess(script.command, env);
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
