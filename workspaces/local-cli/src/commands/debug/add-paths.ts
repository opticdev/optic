import { Command } from '@oclif/command';
import { Client } from '@useoptic/cli-client';
import {
    getPathsRelativeToConfig,
    IApiCliConfig,
    readApiConfig,
} from '@useoptic/cli-config';
import { IPathMapping } from '@useoptic/cli-config';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../../shared/paths';
import colors from 'colors';
import {
    cleanupAndExit,
    developerDebugLogger,
    fromOptic,
    userDebugLogger,
} from '@useoptic/cli-shared';
import { Config } from '../../config';
import { SpectacleInput } from '@useoptic/spectacle';
import { v4 as uuidv4 } from 'uuid';
import { getOrCreateAnonId } from '@useoptic/cli-config/build/opticrc/optic-rc';
import fetch from 'cross-fetch';

export default class DebugPaths extends Command {
    static description =
        'add a static path component to your API specification';
    static hidden: boolean = true;
    static args = [
        {
            name: 'baseUrl',
            description: 'The part of the URL path preceding the static component you wish to add',
            required: true,
        },

        {
            name: 'staticComponent',
            description: 'the new static path component you wish to add',
            required: true,
        },
    ];

    async run() {
        const { args } = this.parse(DebugPaths);
        const { staticComponent, baseUrl } = args;
        if (staticComponent.includes('/')) {
            this.error('staticComponent must be a single path component with no slashes')
        }

        let paths: IPathMapping;
        let config: IApiCliConfig;
        try {
            paths = await getPathsRelativeToConfig();
            config = await readApiConfig(paths.configPath);
        } catch (e) {
            userDebugLogger(e);
            this.log(
                fromOptic(
                    `No optic.yml file found. Add Optic to your API by running ${colors.bold(
                        'api init'
                    )}`
                )
            );
            process.exit(0);
        }
        const spectacleUrl = await this.helper(paths.cwd, config);
        // 1. find parentPathId
        let [, ...targetComponents] = baseUrl.split('/');
        async function spectacleQuery(query: SpectacleInput<{}>) {
            const response = await fetch(spectacleUrl, {
                "headers": {
                    "accept": "application/json",
                    "content-type": "application/json",
                },
                "body": JSON.stringify(query),
                "method": "POST",
            });
            if (response.ok) {
                const body = await response.json();
                return body;
            }
            throw new Error(`something went wrong :(`)
        }
        const listPathsQuery = {
            query: `{
              paths{
                absolutePathPattern
                absolutePathPatternWithParameterNames
                isParameterized
                parentPathId
                pathId
                isRemoved
              }
            }`,
            variables: {}
        }
        const listPathsQueryResult = await spectacleQuery(listPathsQuery)
        const documentedPaths = listPathsQueryResult.data.paths;
        let result = documentedPaths.find((p: any) => {
            if (p.isRemoved) {
                return false;
            }
            const [, ...components] = p.absolutePathPattern
                .split('/')
                .map((x: string) => ({ isParameterized: x === '{}', name: x }))
            if (components.length !== targetComponents.length) {
                return false
            }
            const matches = targetComponents.map((name: string, index: number) => {
                if (components[index].isParameterized) {
                    return true;
                } else {
                    return components[index].name === name
                }
            });
            return matches.every((x: boolean) => x)
        })
        if (!result) {
            throw new Error(`${baseUrl} is not documented in your API yet. Please make sure you have documented every path component in this url`)
        }
        // 2. apply new path command
        const commands = [{ AddPathComponent: { pathId: uuidv4(), parentPathId: result.pathId, name: staticComponent } }]
        let addPathMutation = {
            query: `
    mutation X($commands: [JSON!]!, $batchCommitId: ID!, $commitMessage: String!, $clientId: ID!, $clientSessionId: ID!) {
      applyCommands(commands: $commands, batchCommitId: $batchCommitId, commitMessage: $commitMessage, clientId: $clientId, clientSessionId: $clientSessionId) {
        batchCommitId
      }
    }
            `,
            variables: {
                commands: commands,
                batchCommitId: uuidv4(),
                commitMessage: `added the ${staticComponent} path to the spec`,
                clientId: await getOrCreateAnonId(),
                clientSessionId: uuidv4(),
            },
        }

        const addPathsMutationResult = await spectacleQuery(addPathMutation)
        this.log('done!')
    }


    async helper(basePath: string, config: IApiCliConfig) {
        const daemonState = await ensureDaemonStarted(
            lockFilePath,
            Config.apiBaseUrl
        );
        const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
        developerDebugLogger(`api base url: ${apiBaseUrl}`);
        const cliClient = new Client(apiBaseUrl);
        const cliSession = await cliClient.findSession(basePath, null, null);
        developerDebugLogger({ cliSession });
        const spectacleUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/spectacle`;
        return spectacleUrl
    }
}
