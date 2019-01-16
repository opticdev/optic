#!/usr/bin/env node
import config, {isDev} from "./config";
import program from 'commander'
import pJson from '../package'
import colors from 'colors'
import {attachCommandHelper} from "./helper";
import {startCmd} from "./commands/control/start";
import {stopCmd} from "./commands/control/stop";
import {adduserCmd} from "./commands/control/adduser";
import "regenerator-runtime/runtime";
import {setupFlow} from "./commands/SetupFlow";
import {track} from "./Analytics";
import platform from 'platform'
import updateNotifier from 'update-notifier'
import {jreName} from './jre/jre-install'
import fs from 'fs'
import {initStorage} from "./Storage";
import {stageCmd} from "./commands/control/stage";
import {publishCmd} from "./commands/control/publish";

const storage = initStorage()

const notifier = updateNotifier({pkg: pJson});

const commands = attachCommandHelper(program)

program
	.name('optic')
	.version(pJson.version)


// Commands
commands.attachCommand(adduserCmd)
commands.attachCommand(stageCmd, true, true)
commands.attachCommand(publishCmd, true, true)
commands.attachCommand(startCmd)
commands.attachCommand(stopCmd)

export const standardHelp = () => program.helpInformation()

if (!notifier.update || isDev) { //let's force updates
	processInput()
} else {
	notifier.notify();
	process.exit(0)
}


async function processInput() {

	const firstRun = !(storage.getItemSync('firstRun'))

	const jreInstalled = fs.existsSync(jreName())

	if (firstRun || process.argv[2] === 'force-first-time') {
		track('First Time', {os: platform.os, nodeVersion: platform.version})
		setupFlow()
	} else if (!jreInstalled && !isDev) {
		setupFlow()
	} else {
		if (!process.argv.slice(2).length) {
			//start interactive CLI if just 'optic' is passed
			console.log(standardHelp())
		} else {
			program.parse(process.argv)
		}
	}
}
