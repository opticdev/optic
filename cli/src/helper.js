import {startCmd} from "./commands/control/start";

export function attachCommandHelper(program) {
	return {
		attachCommand: (command, requiresServer) => {
			program
				.command(command.name)
				.action(() => {
					if (requiresServer) {
						startCmd.action(false, false)
						command.action.apply(null, arguments)
					} else {
						command.action.apply(null, arguments)
					}
				})
		}
	}
}
