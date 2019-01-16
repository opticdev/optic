import {startCmd} from "./commands/control/start";
import colors from "colors";
import {catchProjectErrors, shouldStart} from "./optic/AgentSocket";

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
								shouldStart().then(() => {
									catchProjectErrors()
									command.action.apply(null, arguments)
								})
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
