"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = require("@useoptic/proxy");
const command_session_1 = require("./command-session");
const logger_1 = require("./logger");
class CommandAndProxySessionManager {
    constructor(config) {
        this.config = config;
    }
    async run(persistenceManager) {
        const commandSession = new command_session_1.CommandSession();
        const inboundProxy = new proxy_1.HttpToolkitCapturingProxy();
        const servicePort = this.config.serviceConfig.port;
        const serviceHost = this.config.serviceConfig.host;
        const opticServiceConfig = {
            OPTIC_API_PORT: servicePort.toString(),
            OPTIC_API_HOST: serviceHost.toString(),
        };
        await persistenceManager.init(this.config.captureId);
        inboundProxy.events.on('sample', (sample) => {
            logger_1.userDebugLogger(`got sample ${sample.request.method} ${sample.request.path}`);
            persistenceManager.save(sample);
        });
        const target = require('url')
            .format({
            hostname: serviceHost,
            port: servicePort,
            protocol: this.config.serviceConfig.protocol
        });
        logger_1.developerDebugLogger({ target });
        await inboundProxy.start({
            flags: {
                chrome: process.env.OPTIC_ENABLE_CHROME === 'yes',
                includeTextBody: true,
                includeJsonBody: true,
                includeShapeHash: true
            },
            host: this.config.proxyConfig.host,
            proxyTarget: process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes' ? undefined : target,
            proxyPort: this.config.proxyConfig.port
        });
        logger_1.userDebugLogger(`started inbound proxy on port ${this.config.proxyConfig.port}`);
        logger_1.userDebugLogger(`Your command will be run with environment variable OPTIC_API_PORT=${servicePort}.`);
        logger_1.userDebugLogger(`All traffic should go through the inbound proxy on port ${this.config.proxyConfig.port} and it will be forwarded to ${this.config.serviceConfig.host}.`);
        const promises = [];
        logger_1.developerDebugLogger(this.config);
        if (this.config.command) {
            logger_1.userDebugLogger(`running command ${this.config.command}`);
            await commandSession.start({
                command: this.config.command,
                // @ts-ignore
                environmentVariables: Object.assign(Object.assign({}, process.env), opticServiceConfig)
            });
            const commandStoppedPromise = new Promise(resolve => {
                commandSession.events.on('stopped', ({ state }) => {
                    logger_1.developerDebugLogger(`command session stopped (${state})`);
                    resolve();
                });
            });
            promises.push(commandStoppedPromise);
        }
        const processInterruptedPromise = new Promise((resolve) => {
            process.on('SIGINT', () => {
                resolve();
            });
        });
        promises.push(processInterruptedPromise);
        logger_1.developerDebugLogger(`waiting for command to complete or ^C`);
        await Promise.race(promises);
        commandSession.stop();
        await inboundProxy.stop();
    }
}
exports.CommandAndProxySessionManager = CommandAndProxySessionManager;
