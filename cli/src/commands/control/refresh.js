import colors from 'colors'
import exec from "sync-exec";

export const refreshCmd = {
	name: 'refresh',
	action: () => {
		exec("curl -X POST localhost:30333/trigger-refresh")
		console.log(colors.yellow('Current projects refreshed'))
	}
}
