import exec from 'sync-exec'
import {spawn} from 'child_process'
import config from '../../config'
import {serverStatus} from "../../optic/IsRunning";
import fs from 'fs'

export const startCmd = {
	name: 'start',
	action: (logAlreadyStarted = true, killProcessAfterStarting = true) => {

		return new Promise(async (resolve, reject) => {

			if (serverStatus().isRunning) {
				if (logAlreadyStarted) {
					console.log('Optic server already running')
				}
				return resolve(true)
			}

			const out = fs.openSync('./out.log', 'a');
			const err = fs.openSync('./out.log', 'a');

			const binary = await config.runServerCmd.binary()

			const child = spawn(binary, config.runServerCmd.options, {
				detached: true, stdio: ['ignore', out, err] //keep it alive after process ends
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
			while (!serverStatus().isRunning && !failedToStart) {
			}

			if (!failedToStart) {
				console.log('Server Started')
				if (killProcessAfterStarting) {
					reject('could not start')
					process.exit(0)
				}
			} else {
				console.error()
				return reject('could not start')
			}
		})
	}
}
