"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const verify_1 = require("../shared/verify");
class Check extends command_1.Command {
    async run() {
        const { args } = this.parse(Check);
        const { taskName } = args;
        await verify_1.verifyTask(this, taskName);
    }
}
exports.default = Check;
Check.description = 'Validate the correctness of a task in your optic.yml';
Check.args = [{
        name: 'taskName',
    }];
