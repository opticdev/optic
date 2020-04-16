"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_client_1 = require("@useoptic/cli-client");
const cli_config_1 = require("@useoptic/cli-config");
const cli_config_2 = require("@useoptic/cli-config");
const cli_server_1 = require("@useoptic/cli-server");
const cli_server_2 = require("@useoptic/cli-server");
const cli_server_3 = require("@useoptic/cli-server");
const domain_1 = require("@useoptic/domain");
const colors = require("colors");
const path = require("path");
const cp = require("child_process");
const conversation_1 = require("./conversation");
const logger_1 = require("./logger");
const paths_1 = require("./paths");
const command_and_proxy_session_manager_1 = require("./command-and-proxy-session-manager");
const uuidv4 = require("uuid/v4");
const findProcess = require("find-process");
const fs = require("fs-extra");
async function setupTaskWithConfig(cli, taskName, paths, config) {
    const { cwd, capturesPath, specStorePath } = paths;
    const task = config.tasks[taskName];
    if (!task) {
        return cli.log(colors.red(`No task ${colors.bold(taskName)} found in optic.yml`));
    }
    const captureId = uuidv4();
    const startConfig = await cli_config_1.TaskToStartConfig(task, captureId);
    const blockers = await findProcess('port', startConfig.proxyConfig.port);
    if (blockers.length > 0) {
        cli.error(`Optic needs to start a proxy server on port ${startConfig.proxyConfig.port}.
There is something else running on this port:
${blockers.map(x => `[pid ${x.pid}]: ${x.cmd}`).join('\n')}
`);
    }
    const daemonState = await cli_server_1.ensureDaemonStarted(paths_1.lockFilePath);
    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    logger_1.developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new cli_client_1.Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(cwd, startConfig);
    logger_1.developerDebugLogger({ cliSession });
    const uiBaseUrl = cli_server_3.makeUiBaseUrl(daemonState);
    const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/diffs`;
    cli.log(conversation_1.fromOptic(`Review the API Diff live at ${uiUrl}`));
    // start proxy and command session
    const persistenceManagerFactory = () => {
        return new cli_server_1.FileSystemCaptureSaver({
            captureBaseDirectory: capturesPath
        });
    };
    try {
        await runTask(startConfig, persistenceManagerFactory);
    }
    catch (e) {
        cli.error(e.message);
    }
    finally {
        const loader = new cli_server_2.FileSystemCaptureLoader({
            captureBaseDirectory: capturesPath
        });
        await cliClient.markCaptureAsCompleted(cliSession.session.id, captureId);
        const filter = cli_config_1.parseIgnore(config.ignoreRequests || []);
        const capture = await loader.loadWithFilter(captureId, filter);
        const specAsBuffer = await fs.readFile(specStorePath);
        if (await domain_1.checkDiffOrUnrecognizedPath(specAsBuffer.toString(), capture.samples)) {
            const shouldBeNodePath = process.argv[0];
            const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/diffs/${captureId}`;
            const notifyScriptPath = path.resolve(__dirname, '../../scripts/notify.js');
            cp.spawn(shouldBeNodePath, [notifyScriptPath, uiUrl], { detached: true, stdio: ['ignore', null, null] });
            cli.log(conversation_1.fromOptic(`Observed Unexpected API Behavior. Click here to review: ${uiUrl}`));
        }
        else {
            cli.log(conversation_1.fromOptic(`All API interactions followed your specification.`));
        }
    }
}
async function setupTask(cli, taskName) {
    try {
        const paths = await cli_config_2.getPathsRelativeToConfig();
        const config = await cli_config_2.readApiConfig(paths.configPath);
        try {
            await setupTaskWithConfig(cli, taskName, paths, config);
        }
        catch (e) {
            cli.error(e);
        }
    }
    catch (e) {
        logger_1.userDebugLogger(e);
        cli.log(conversation_1.fromOptic('Optic needs more information about your API to continue.'));
        process.exit(0);
    }
    process.exit(0);
}
exports.setupTask = setupTask;
async function runTask(taskConfig, persistenceManagerFactory) {
    const sessionManager = new command_and_proxy_session_manager_1.CommandAndProxySessionManager(taskConfig);
    const persistenceManager = persistenceManagerFactory();
    await sessionManager.run(persistenceManager);
    if (process.env.OPTIC_ENV === 'development') {
        await cli_server_1.ensureDaemonStopped(paths_1.lockFilePath);
    }
}
exports.runTask = runTask;
