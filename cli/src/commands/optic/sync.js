import {startCmd} from "../control/start";
import {SyncIntent} from "../../interactive/intent/SyncIntent";
import {contentModesEnum} from "../../interactive/constants/ContentModes";
import {track} from "../../Analytics";

export const syncCmd = {
	name: 'sync',
	action: () => {
		startCmd.action(false, false)
		const {startInteractive} = require( '../../interactive/Interactive' )
		startInteractive({contentMode: contentModesEnum.SYNC, inputValue: ''})

		track('Sync Init')

		setTimeout(() => {
			const sync = new SyncIntent()
			global.currentScreen.setState({intent: sync})
			sync.start()
		}, 350)
	}
}
