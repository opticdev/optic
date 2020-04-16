"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const run_task_1 = require("../shared/run-task");
class Start extends command_1.Command {
    async run() {
        await run_task_1.setupTask(this, 'start');
    }
}
exports.default = Start;
Start.description = 'starts your API process behind a proxy';
