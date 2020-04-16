import { IOpticTaskRunnerConfig } from '@useoptic/cli-config';
import { ICaptureSaver } from '@useoptic/cli-server';
declare class CommandAndProxySessionManager {
    private config;
    constructor(config: IOpticTaskRunnerConfig);
    run(persistenceManager: ICaptureSaver): Promise<void>;
}
export { CommandAndProxySessionManager };
