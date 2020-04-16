"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const cli_client_1 = require("@useoptic/cli-client");
const cli_config_1 = require("@useoptic/cli-config");
const cli_server_1 = require("@useoptic/cli-server");
const cli_server_2 = require("@useoptic/cli-server");
const conversation_1 = require("../shared/conversation");
const logger_1 = require("../shared/logger");
const paths_1 = require("../shared/paths");
const colors = require("colors");
const openBrowser = require("react-dev-utils/openBrowser");
class Spec extends command_1.Command {
    async run() {
        let paths;
        let config;
        try {
            paths = await cli_config_1.getPathsRelativeToConfig();
            config = await cli_config_1.readApiConfig(paths.configPath);
        }
        catch (e) {
            logger_1.userDebugLogger(e);
            this.log(conversation_1.fromOptic(`No optic.yml file found. Add Optic to your API by running ${colors.bold('api init')}`));
            process.exit(0);
        }
        logger_1.developerDebugLogger(paths);
        await this.helper(paths.cwd, config);
    }
    async helper(basePath, config) {
        const daemonState = await cli_server_1.ensureDaemonStarted(paths_1.lockFilePath);
        const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
        logger_1.developerDebugLogger(`api base url: ${apiBaseUrl}`);
        const cliClient = new cli_client_1.Client(apiBaseUrl);
        const cliSession = await cliClient.findSession(basePath, null);
        logger_1.developerDebugLogger({ cliSession });
        const uiBaseUrl = cli_server_2.makeUiBaseUrl(daemonState);
        const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/dashboard`;
        openBrowser(uiUrl);
    }
}
exports.default = Spec;
Spec.description = 'Open your Optic API specification';
