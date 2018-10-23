#!/usr/bin/env node
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
import storage from 'node-persist'
import "regenerator-runtime/runtime";
import {setupFlow} from "./commands/SetupFlow";
import {track} from "./Analytics";
import platform from 'platform'

const commands = attachCommandHelper(program)

program
	.name('optic')
	.version(pJson.version)

//Control Commands
commands.attachCommand(startCmd)
commands.attachCommand(stopCmd)
commands.attachCommand(installPluginsCmd, true)
commands.attachCommand(initCmd)
commands.attachCommand(refreshCmd)
// commands.attachCommand(createuserCmd)
// commands.attachCommand(adduserCmd)

//Optic Commands
commands.attachCommand(searchCmd)
commands.attachCommand(syncCmd)

async function processInput() {

	await storage.init()
	const firstRun = !(await storage.getItem('firstRun'))

	if (firstRun || process.argv[2] === 'force-first-time') {
		track('First Time', {os: platform.os, nodeVersion: platform.version})
		setupFlow()
	} else {
		if (!process.argv.slice(2).length) {
			//start interactive CLI if just 'optic' is passed
			await startCmd.action(false, false)
			const {startInteractive} = require('./interactive/Interactive')
			startInteractive({})
		} else {
			program.parse(process.argv)
		}
	}
}

// const m = require('./jre/index')
// console.log(m.driver())

processInput()
