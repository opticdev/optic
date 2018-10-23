import colors from 'colors'
import request from "request";

export const refreshCmd = {
	name: 'refresh',
	action: () => {
		request.post('http://localhost:30333/trigger-refresh', {}, () => {
			console.log(colors.yellow('Current projects refreshed'))
		})
	}
}
