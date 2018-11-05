import {startCmd} from "./commands/control/start";
import colors from "colors";

export function attachCommandHelper(program) {
	return {
		attachCommand: (command, requiresServer) => {
			const cmd = program
				.command(command.name)
				.action(() => {
					if (requiresServer) {
						const p = startCmd.action(false, false)
						p.then(() => {
							command.action.apply(null, arguments)
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
