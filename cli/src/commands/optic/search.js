import {startCmd} from "../control/start";
import {track} from "../../Analytics";
import colors from "colors";

export const searchCmd = {
	name: 'search',
	description: 'search for [input]',
	action: (cmd) => {
		const searchIndex = cmd.rawArgs.indexOf('search')
		const remaining = cmd.rawArgs.slice(searchIndex+1).join(' ')
		const p = startCmd.action(false, false)

		p.then(() => {
			const {startInteractive} = require( '../../interactive/Interactive' )
			track('Search Init', {query: remaining})
			startInteractive({inputValue: remaining})
		})

		p.catch(() => console.log(colors.red('Could not start server, unknown error')))
	}
}
