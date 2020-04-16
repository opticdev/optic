"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const cli_server_1 = require("@useoptic/cli-server");
const paths_1 = require("../../shared/paths");
class DaemonStop extends command_1.Command {
    async run() {
        await cli_server_1.ensureDaemonStarted(paths_1.lockFilePath);
        this.log('Done!');
    }
}
exports.default = DaemonStop;
DaemonStop.description = 'ensures the Optic daemon has been started';
DaemonStop.hidden = true;
