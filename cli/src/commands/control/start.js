import exec from 'sync-exec'
import {spawn} from 'child_process'
import config from '../../config'
import {serverStatus} from "../../optic/IsRunning";
import fs from 'fs'

export const startCmd = {
	name: 'start',
	action: (logAlreadyStarted = true, killProcessAfterStarting = true) => {

		if (serverStatus().isRunning) {
			if (logAlreadyStarted) {
				console.log('Optic server already running')
			}
			return true
		}

		const out = fs.openSync('./out.log', 'a');
		const err = fs.openSync('./out.log', 'a');

		const child = spawn(config.runServerCmd.binary, config.runServerCmd.options, {
			detached: true, stdio: [ 'ignore', out, err ] //keep it alive after process ends
		})

		console.log('Starting Optic Server...')
		//
		// child.stdout.on('data', function(data) {
		// 	serverLog.push(data)
		// });

		let failedToStart = false

		child.on('error', function (data) {
			failedToStart = true
		});

		child.on('exit', function (code, signal) {
			failedToStart = true
		});


		//10 second start timeout
		setTimeout(() => {
			failedToStart = true
		}, 10000)

		//hold thread until started.
		while(!serverStatus().isRunning && !failedToStart) {}

		if (!failedToStart) {
			console.log('Server Started')
			if (killProcessAfterStarting) {
				process.exit(0)
			}
		} else {
			console.error()
			throw new Error('Could not start Optic server')
		}

	}
}
