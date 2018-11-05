#!/usr/bin/env node
import config, {isDev} from "./config";
import program from 'commander'
import pJson from '../package'
import colors from 'colors'
import {attachCommandHelper} from "./helper";
import {startCmd} from "./commands/control/start";
import {stopCmd} from "./commands/control/stop";
import {installPluginsCmd} from "./commands/control/installplugins";
import {initCmd} from "./commands/control/init";
import {refreshCmd} from "./commands/control/refresh";
import {createuserCmd} from "./commands/control/createuser";
import {adduserCmd} from "./commands/control/adduser";
import {syncCmd} from "./commands/optic/sync";
import {serverStatus} from "./optic/IsRunning";
import {startInteractive} from "./interactive/Interactive";
import {searchCmd} from "./commands/optic/search";
import "regenerator-runtime/runtime";
import {setupFlow} from "./commands/SetupFlow";
import {track} from "./Analytics";
import platform from 'platform'
import updateNotifier from 'update-notifier'
import {jreName} from './jre/jre-install'
import fs from 'fs'
import {initStorage} from "./Storage";

const storage = initStorage()

const notifier = updateNotifier({pkg: pJson});

const commands = attachCommandHelper(program)

program
	.name('optic')
	.version(pJson.version)

//Optic Commands
commands.attachCommand(searchCmd)
commands.attachCommand(syncCmd)

//Control Commands
commands.attachCommand(initCmd)
commands.attachCommand(startCmd)
commands.attachCommand(stopCmd)
commands.attachCommand(installPluginsCmd, true)
commands.attachCommand(refreshCmd)
// commands.attachCommand(createuserCmd)
// commands.attachCommand(adduserCmd)

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
		setupFlow(true)
	} else {
		if (!process.argv.slice(2).length) {
			//start interactive CLI if just 'optic' is passed
			const p = startCmd.action(false, false)
			p.then(() => {
				const {startInteractive} = require('./interactive/Interactive')
				startInteractive({})
			})

			p.catch(() => {
				console.log(colors.red('Could not start server, unknown error'))
			})
		} else {
			program.parse(process.argv)
		}
	}
}
