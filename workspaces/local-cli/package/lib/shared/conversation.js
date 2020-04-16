"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("colors");
function fromOptic(string) {
    return `${colors.cyan('[optic]')} ${string}`;
}
exports.fromOptic = fromOptic;
