import colors from 'colors'
import request from "request";
import {track} from "../../Analytics";

export const refreshCmd = {
	name: 'refresh',
	description: 're-compiles Optic skills',
	action: () => {
		track('Refresh triggered')
		request.post('http://localhost:30333/trigger-refresh', {}, () => {
			console.log(colors.yellow('Current projects refreshed'))
		})
	}
}
