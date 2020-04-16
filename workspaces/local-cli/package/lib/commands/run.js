"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const run_task_1 = require("../shared/run-task");
class Run extends command_1.Command {
    async run() {
        const { args } = this.parse(Run);
        const { taskName } = args;
        await run_task_1.setupTask(this, taskName);
    }
}
exports.default = Run;
Run.description = 'Run a task from your optic.yml';
Run.args = [{
        name: 'taskName',
    }];
