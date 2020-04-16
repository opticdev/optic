"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const events_1 = require("events");
const treeKill = require("tree-kill");
const logger_1 = require("./logger");
class CommandSession {
    constructor() {
        this.isRunning = false;
        this.events = new events_1.EventEmitter();
    }
    start(config, silent = false) {
        const taskOptions = {
            env: Object.assign(Object.assign({}, process.env), config.environmentVariables),
            shell: true,
            cwd: process.cwd(),
            stdio: silent ? 'ignore' : 'inherit',
        };
        this.isRunning = true;
        this.child = child_process_1.spawn(config.command, taskOptions);
        this.events.once('stopped', (e) => {
            this.isRunning = false;
        });
        this.child.on('exit', (code) => {
            logger_1.developerDebugLogger(`command process exited with code ${code}`);
            this.events.emit('stopped', { state: code ? 'failed' : 'completed' });
        });
        return this.child;
    }
    stop() {
        if (this.isRunning && this.child) {
            treeKill(this.child.pid, (e) => {
                if (e) {
                    console.error(e);
                }
                this.events.emit('stopped', { state: 'terminated' });
            });
        }
    }
}
exports.CommandSession = CommandSession;
