import colors from 'colors'
import inquirer from 'inquirer'
import {startCmd} from "./start";
import request from 'request'
import {track} from "../../Analytics";

export const installPluginsCmd = {
	name: 'installplugins',
	description: 'starts plugin installer',
	action: (callback) => {

		const p = startCmd.action(false, false)

		p.then((started) => {
			if (started) {
				console.log('Searching for IDEs...')

				request.get('http://localhost:30333/installer/ide-plugins', {}, (err, response, body) => {
					console.log(body)
					const ides = JSON.parse(body)
					const choices = ides.map((i) => {
						return {name: i, checked: true}
					})

					track('IDEs found', choices)

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

								request.post('http://localhost:30333/installer/ide-plugins', {qs: {install: selectedIdes.join(',')}}, (err, response, body) => {
									const results = JSON.parse(body)
									Object.entries(results).forEach((i) =>
										console.log(`${i[0]}: ${i[1] ? colors.green('Success') : colors.red('Failed')}`))

									track('IDEs installed', results)

									if (typeof callback === 'function') {
										callback()
									} else {
										process.exit(0)
									}

								})

							} else {
								if (typeof callback === 'function') {
									callback()
								} else {
									process.exit(0)
								}
							}

						});
				})
			} else {
				console.error('Could not connect to Optic server')
			}
		})

		p.catch(() => console.log(colors.red('Could not start server, unknown error')))
	}
}
