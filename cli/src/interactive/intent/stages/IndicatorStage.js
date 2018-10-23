import {StageBase} from "../base/StageBase";
import {contentModesEnum} from "../../constants/ContentModes";
import {resetToMain} from "../../actions/StateMutations";

export class IndicatorStage extends StageBase {

	constructor(setIndicator) {
		super()
		this._setIndicator = setIndicator
		this._result = undefined
	}

	result() {
		return this._result
	}

	setup(triggerNext) {
		if (this._setIndicator) {
			const {text, keyBindings, bottomHelp} = this._setIndicator()
			global.currentScreen.setState({indicator: {
				text, keyBindings, bottomHelp
			}})

			setTimeout(() => {
				global.currentScreen.getRawNodeById('indicatorContent').scrollTo(0)
				global.currentScreen.getRawNodeById('contentRegion').scrollTo(0)
			}, 10)
		}
	}

	cleanup() {
		global.currentScreen.setState({indicator: null})
	}


}
