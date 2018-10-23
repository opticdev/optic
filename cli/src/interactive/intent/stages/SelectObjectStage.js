import {StageBase} from "../base/StageBase";
import {contentModesEnum} from "../../constants/ContentModes";
import {resetToMain} from "../../actions/StateMutations";

export class SelectObjectStage extends StageBase {

	constructor() {
		super()
		this._result = undefined
		this.select = this.select.bind(this)
	}

	select(object) {
		this._result = object
	}

	result() {
		return this._result
	}

	setup(triggerNext) {
		global.currentScreen.setState({contentMode: contentModesEnum.SELECT_OBJECT, inputValue: ''})
	}

	cleanup() {
		global.currentScreen.setState({contentMode: contentModesEnum.EMPTY, inputValue: ''})
	}


}
