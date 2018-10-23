import {spawn} from 'child_process'
import config from '../../config'
import {serverStatus} from "../../optic/IsRunning";
import fs from 'fs'
import {track} from "../../Analytics";
const appRootPath = require('app-root-path').toString()

export const startCmd = {
	name: 'start',
	description: 'starts local Optic server',
	action: (logAlreadyStarted = true, killProcessAfterStarting = true) => {

		return new Promise(async (resolve, reject) => {


			const status = await serverStatus()
			if (status.isRunning) {
				if (logAlreadyStarted) {
					console.log('Optic server already running')
				}
				return resolve(true)
			}

			const out = fs.openSync(appRootPath+'/out.log', 'a');
			const err = fs.openSync(appRootPath+'/out.log', 'a');

			const binary = await config.runServerCmd.binary()

			const child = spawn(binary, config.runServerCmd.options, {
				detached: true,
				stdio: ['ignore', out, err] //keep it alive after process ends
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
			while (!((await serverStatus()).isRunning) && !failedToStart) {
			}

			if (!failedToStart) {
				console.log('Server Started')
				track('Server Started')
				resolve(true)
				if (killProcessAfterStarting) {
					process.exit(0)
				}
			} else {
				return reject('could not start')
			}
		})
	}
}
