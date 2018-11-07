import {startCmd} from "../control/start";
import {SyncIntent} from "../../interactive/intent/SyncIntent";
import {contentModesEnum} from "../../interactive/constants/ContentModes";
import {track} from "../../Analytics";
import colors from "colors";

export const syncCmd = {
	name: 'sync',
	description: 'triggers sync',
	action: () => {

		const p = startCmd.action(false, false)

		p.then(() => {

			const {startInteractive} = require( '../../interactive/Interactive' )
			startInteractive({contentMode: contentModesEnum.SYNC, inputValue: ''})

			track('Sync Init')

			setTimeout(() => {
				const sync = new SyncIntent()
				global.currentScreen.setState({intent: sync})
				sync.start()
			}, 350)

		})

		p.catch(() => console.log(colors.red('Could not start server, unknown error')))
	}
}
