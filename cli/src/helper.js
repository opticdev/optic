import {startCmd} from "./commands/control/start";

export function attachCommandHelper(program) {
	return {
		attachCommand: (command, requiresServer) => {
			const cmd = program
				.command(command.name)
				.action(() => {
					if (requiresServer) {
						startCmd.action(false, false)
						command.action.apply(null, arguments)
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
