import {IntentBase} from "./base/IntentBase";
import {IndicatorStage} from "./stages/IndicatorStage";
import {resetToMain} from "../actions/StateMutations";
import {contentModesEnum} from "../constants/ContentModes";
import {contextHelpText, contextName, contextText} from "../constants/ContextText";
import {JSONStage} from "./stages/JSONStage";
import {routeSchema} from "../json-editor/test/ExampleSchemas";
import {PostModifyRequest} from "../../optic/PostChanges";

export class ModifyIntent extends IntentBase {
	constructor(contextItem) {
		super({stages: [
			new IndicatorStage(() => {
				return {
					text: contextText(global.currentScreen.currentState().context, contextItem),
					keyBindings: {
						'escape': () => this.finish(),
						'm': () => this.next()
					},
					bottomHelp: contextHelpText
				}
			}),
			new JSONStage({
				initialValue: contextItem.value,
				schema: contextItem.schema,
				onFinish: (newValue) => this.finish(true, newValue)
			})
		], item: contextItem})

		this.type = 'Modify'
	}

	titleText() {
		return contextName(this._item)
	}

	start() {
		global.currentScreen.setState({contentMode: contentModesEnum.CONTEXT})
		super.start()
	}

	finish(modify, newValue) {
		if (modify) {
			const {context} = global.currentScreen.currentState()
			PostModifyRequest(this._item.id, newValue.value, (!!context) ? context.editorSlug : undefined)
		}
		resetToMain()
		super.finish()
	}
}
