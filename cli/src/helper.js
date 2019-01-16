import {startCmd} from "./commands/control/start";
import colors from "colors";
import {parseOpticYaml} from "./optic/configyaml";
import path from 'path'
import config from './config'

export function attachCommandHelper(program) {
	return {
		attachCommand: (command, requiresServer, requiresProject) => {
			const cmd = program
				.command(command.name)
				.action(() => {
					if (requiresServer) {
						const p = startCmd.action(false, false)
						p.then(() => {
							if (requiresProject) {

								const configFilePath = path.join(config.projectDirectory, 'optic.yml').toString()
								const parseResults = parseOpticYaml(configFilePath)
								if (parseResults.error) {
									console.log(colors.red('Error reading configuration from optic.yml: '+parseResults.error))
									process.exit(0)
								} else {
									command.action.call(null, arguments, parseResults.config)
								}

							} else {
								command.action.apply(null, arguments)
							}
						})
						p.catch(() => console.log(colors.red('Could not start server, unknown error')))
					} else {
						command.action.apply(null, arguments)
					}
				})
				.description(command.description)

			if (command.options && Array.isArray(command.options)) {
				command.options.forEach((i) => cmd.option(i[0], i[1]))
			}

		}
	}
}
