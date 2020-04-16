"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const Listr = require("listr");
const colors = require("colors");
//@ts-ignore
const niceTry = require("nice-try");
const conversation_1 = require("./conversation");
const cli_config_1 = require("@useoptic/cli-config");
const command_session_1 = require("./command-session");
const waitOn = require("wait-on");
const proxy_1 = require("@useoptic/proxy");
function verifyTask(cli, taskName) {
    cli.log(conversation_1.fromOptic(colors.bold(`Testing task '${taskName}' `)));
    cli.log('\n' + colors.underline('Assertions'));
    let foundTask;
    let startConfig;
    let fixUrl = 'docs.useoptic.com/idk...yet';
    const tasks = new Listr([
        {
            title: `Task '${taskName}' exists`,
            task: async () => {
                const taskExists = await niceTry(async () => {
                    const paths = await cli_config_1.getPathsRelativeToConfig();
                    const config = await cli_config_1.readApiConfig(paths.configPath);
                    const task = config.tasks[taskName];
                    foundTask = task;
                    if (foundTask) {
                        startConfig = await cli_config_1.TaskToStartConfig(task, 'mock-capture');
                    }
                    return Boolean(task);
                });
                if (!taskExists) {
                    throw new Error(`Task ${taskName} not found`);
                }
            }
        },
        {
            title: `The command provided starts your API on the ${colors.bold('$OPTIC_API_PORT')}`,
            task: async (cxt, task) => {
                const commandSession = new command_session_1.CommandSession();
                const serviceConfig = startConfig.serviceConfig;
                const servicePort = serviceConfig.port;
                const serviceHost = serviceConfig.host;
                const opticServiceConfig = {
                    OPTIC_API_PORT: servicePort.toString(),
                    OPTIC_API_HOST: serviceHost.toString(),
                };
                const expected = `${serviceConfig.host}:${serviceConfig.port}`;
                task.title = `Your command, ${colors.bold.blue(startConfig.command)}, starts your API on the host and port Optic assigns it ${colors.bold(expected)}`;
                await commandSession.start({
                    command: startConfig.command,
                    // @ts-ignore
                    environmentVariables: Object.assign(Object.assign({}, process.env), opticServiceConfig)
                }, true);
                let status = 'running';
                let serviceRunning = false;
                const commandStoppedPromise = new Promise(resolve => {
                    commandSession.events.on('stopped', ({ state }) => {
                        status = state;
                        resolve();
                    });
                });
                const serviceRunningPromise = new Promise(async (resolve) => {
                    waitOn({
                        resources: [
                            `tcp:${expected}`
                        ],
                        delay: 0,
                        tcpTimeout: 500,
                        timeout: 15000,
                    }).then(() => {
                        serviceRunning = true;
                        resolve(true);
                    }) //if service resolves we assume it's up.
                        .catch(() => resolve(false));
                });
                const finished = await Promise.race([commandStoppedPromise, serviceRunningPromise]);
                commandSession.stop();
                if (status !== 'running') {
                    throw new Error('Your command exited early or was not long-running.');
                }
                if (!serviceRunning) {
                    throw new Error(`Your API was not started on the expected port ${expected}`);
                }
            }
        },
        {
            title: `Optic can start`,
            task: async (cxt, task) => {
                const proxyConfig = startConfig.proxyConfig;
                const proxyPort = proxyConfig.port;
                const proxyHost = proxyConfig.host;
                const serviceConfig = startConfig.serviceConfig;
                const servicePort = serviceConfig.port;
                const serviceHost = serviceConfig.host;
                const expected = `${proxyHost}:${proxyPort}`;
                task.title = `Optic proxy can start on ${expected}`;
                const inboundProxy = new proxy_1.HttpToolkitCapturingProxy();
                const target = require('url')
                    .format({
                    hostname: serviceHost,
                    port: servicePort,
                    protocol: serviceConfig.protocol
                });
                await inboundProxy.start({
                    flags: {
                        chrome: process.env.OPTIC_ENABLE_CHROME === 'yes',
                        includeTextBody: true,
                        includeJsonBody: true,
                        includeShapeHash: true
                    },
                    host: proxyConfig.host,
                    proxyTarget: process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes' ? undefined : target,
                    proxyPort: proxyConfig.port
                });
                const proxyRunningPromise = await new Promise(async (resolve) => {
                    waitOn({
                        resources: [
                            `tcp:${expected}`
                        ],
                        delay: 0,
                        tcpTimeout: 500,
                        timeout: 15000,
                    }).then(() => {
                        resolve(true);
                    }) //if service resolves we assume it's up.
                        .catch(() => resolve(false));
                });
                await inboundProxy.stop();
                if (!proxyRunningPromise) {
                    throw new Error(`Optic proxy was unable to start on ${expected}`);
                }
            }
        }
    ]);
    tasks.run()
        .then(() => {
        cli.log('\n\n' + conversation_1.fromOptic(colors.green(`Nice work! Optic is setup properly. Now run ${colors.bold(`api run ${taskName}`)}`)));
    })
        .catch((err) => {
        cli.log('\n\n' + conversation_1.fromOptic(colors.red('Optic has detected some issues with your setup')));
        cli.log(conversation_1.fromOptic(colors.red(`Error 4 -- Solution at ${fixUrl}`)));
        process.exit(0);
        // cli.log(colors.red(err.message));
    });
}
exports.verifyTask = verifyTask;
