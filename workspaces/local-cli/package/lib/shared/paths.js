"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const os = require("os");
exports.lockFilePath = path.join(os.homedir(), '.optic', 'daemon-lock.json');
