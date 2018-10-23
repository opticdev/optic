import {startCmd} from "../control/start";
import {track} from "../../Analytics";

export const searchCmd = {
	name: 'search',
	description: 'search for [input]',
	action: (cmd) => {
		const searchIndex = cmd.rawArgs.indexOf('search')
		const remaining = cmd.rawArgs.slice(searchIndex+1).join(' ')
		startCmd.action(false, false)
		const {startInteractive} = require( '../../interactive/Interactive' )
		track('Search Init', {query: remaining})
		startInteractive({inputValue: remaining})
	}
}
