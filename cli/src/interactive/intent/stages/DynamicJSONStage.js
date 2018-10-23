import {StageBase} from "../base/StageBase";
import {contentModesEnum} from "../../constants/ContentModes";
import {resetToMain} from "../../actions/StateMutations";
import {printState, printVisibleElements} from "../../debuggers/commands";

export class DynamicJSONStage extends StageBase {

	constructor(configure) {
		super()
		this._configure = configure
		this._result = undefined
	}

	result() {
		return this._result
	}

	setup(triggerNext) {
		const {initialValue, schema, onFinish} = this._configure()

		const editorDisplayManager = global.currentScreen.currentState().editorDisplayManager
		editorDisplayManager.setupFor(initialValue, schema)
		editorDisplayManager.onFinish((result) => {
			this._result = result
			if (typeof onFinish === 'function') {
				onFinish(result)
			} else {
				triggerNext()
			}
		})
		global.currentScreen.setState({
			editorDisplayManager,
			contentMode: contentModesEnum.JSON_INPUT,
			indicator: null
		})
	}

	cleanup() {
	}


}
