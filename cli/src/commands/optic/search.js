import {startCmd} from "../control/start";

export const searchCmd = {
	name: 'search',
	action: (cmd) => {
		const searchIndex = cmd.rawArgs.indexOf('search')
		const remaining = cmd.rawArgs.slice(searchIndex+1).join(' ')
		startCmd.action(false, false)
		const {startInteractive} = require( '../../interactive/Interactive' )
		startInteractive({inputValue: remaining})
	}
}
