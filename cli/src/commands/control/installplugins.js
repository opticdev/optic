import {agentConnection} from "../../optic/AgentSocket";
import {enforceTimeout} from "../../optic/EnforceTimeout";
import exec from "sync-exec";
import niceTry from "nice-try";
import colors from 'colors'
import inquirer from 'inquirer'
import {startCmd} from "./start";

export const installPluginsCmd = {
	name: 'installplugins',
	action: (callback) => {

		startCmd.action(false, false).then((started) => {
			if (started) {
				console.log('Searching for IDEs...')

				const getIDEsResult = exec(`curl localhost:30333/installer/ide-plugins`)
				const ides = JSON.parse(getIDEsResult.stdout)
				const choices = ides.map((i) => {
					return {name: i, checked: true}
				})

				inquirer
					.prompt([
						{
							type: 'checkbox',
							message: 'Select IDE Plugins to install',
							name: 'selectedIdes',
							choices
						}])
					.then(({selectedIdes}) => {
						if (selectedIdes.length) {
							console.log('Starting install (this will take a minute)...')
							const installResults = exec(`curl -X POST localhost:30333/installer/ide-plugins?install=${selectedIdes.join(',')}`)
							const results = JSON.parse(installResults.stdout)
							Object.entries(results).forEach((i) =>
								console.log(`${i[0]}: ${i[1] ? colors.green('Success') : colors.red('Failed')}`))
						}


						if (typeof callback === 'function') {
							callback()
						} else {
							process.exit(0)
						}

					});
			} else {
				console.error('Could not connect to Optic server')
			}
		})
	}
}
