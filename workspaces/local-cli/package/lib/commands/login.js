"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const openBrowser = require("react-dev-utils/openBrowser");
class Login extends command_1.Command {
    async run() {
        openBrowser('https://auth.useoptic.com/login');
    }
}
exports.default = Login;
Login.description = 'Login to Optic from the CLI';
