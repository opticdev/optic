"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const cli_config_1 = require("@useoptic/cli-config");
const colors = require("colors");
const cli_ux_1 = require("cli-ux");
const conversation_1 = require("../shared/conversation");
const fs = require("fs-extra");
const path = require("path");
const analytics_1 = require("../shared/analytics");
class Init extends command_1.default {
    async run() {
        const cwd = process.cwd();
        if (fs.existsSync(path.join(cwd, 'optic.yml'))) {
            return this.log(colors.red(`This directory already has an ${colors.bold('optic.yml')} file.`));
        }
        const shouldUseThisDirectory = await cli_ux_1.default.confirm(`${colors.bold.blue(cwd)}\nIs this your API's root directory? (yes/no)`);
        if (!shouldUseThisDirectory) {
            this.log(colors.red(`Optic must be initialized in your API's root directory. Change your working directory and then run ${colors.bold('api init')} again`));
            process.exit(1);
        }
        const name = await cli_ux_1.default.prompt('What is this API named?');
        await analytics_1.track('New API Created', { name });
        const config = `
name: ${name}
tasks:
  # The default task, invoke using \`api run start\`
  # Learn how to finish setting up Optic at http://docs.useoptic.com/setup
  start:
    command: echo "Setup A Valid Command to Start your API!"
    baseUrl: http://localhost:4000
ignoreRequests:
- OPTIONS *`.trimLeft();
        const token = await Promise.resolve('token-from-backend');
        const { configPath } = await cli_config_1.createFileTree(config, token, cwd);
        cli_ux_1.default.log(conversation_1.fromOptic(`Added Optic configuration to ${configPath}`));
        cli_ux_1.default.log(conversation_1.fromOptic(`Open that file to finish adding Optic to your API`));
        process.exit();
    }
}
exports.default = Init;
Init.description = 'Add Optic to your API';
