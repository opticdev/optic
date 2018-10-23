import {IntentBase} from "./base/IntentBase";
import {JSONStage} from "./stages/JSONStage";
import {routeSchema} from "../json-editor/test/ExampleSchemas";
import {IndicatorStage} from "./stages/IndicatorStage";
import {resetToMain} from "../actions/StateMutations";
import {agentConnection} from "../../optic/AgentSocket";
import {SelectObjectStage} from "./stages/SelectObjectStage";
import {emptyAsk} from "../json-editor/FieldPredicates";
import {DynamicJSONStage} from "./stages/DynamicJSONStage";
import {AsChildOf, Clipboard} from "../../optic/PostChangesInterfaces";
import {PostGenerateFromRelationshipRequest} from "../../optic/PostChanges";
import {track} from "../../Analytics";

export class GenerateFromRelationship extends IntentBase {
	constructor(transformation) {

		track('Generate from relationship Intent', {transformation})

		//listen + ask for transformation options
		agentConnection().onTransformationOptions((results) => {
			if (!results.error) {
				global.currentScreen.setState({objectSelectionOptions: results.options})
			} else {
				global.currentScreen.setState({objectSelectionOptions: []})
			}
		}, true)

		agentConnection().actions.getTransformationOptions(transformation.transformationRef)

		super({stages: [
			new SelectObjectStage(),
			new DynamicJSONStage(() => {
				const selectStage = this._stages[0]
				return {initialValue: {}, schema: selectStage.result()}
			}),
			new IndicatorStage(() => {
				const selectStage = this._stages[0].result()
				const hasContext = !!global.currentScreen.currentState().context

				return {
					text: finalizeText(this._item, selectStage.name),
					keyBindings: {
					'escape': () => this.finish(),
					'return': () => this.finish(true, !hasContext),
					'c': () => this.finish(true, true)
				}}
			})
			], item: transformation})

		this.type = 'GenerateFromRelationship'

		this.selectObject = this.selectObject.bind(this)
	}

	selectObject(object) {
		const selectStage = this._stages[0]
		selectStage.select(object)
		if (emptyAsk(object.combinedAsk)) {
			this.switchTo(2)
		} else {
			this.switchTo(1)
		}
	}

	titleText() {
		switch (this._stage) {
			case 0:
				return `Select {bold}${this._item.fromName}{/bold}`
			case 2:
				return `Generating {bold}${this._item.toName}{/bold} from {bold}${this._item.fromName}{/bold}`
			default:
				return 'abc'
		}
	}

	finish(generate, toClipboard) {
		if (generate) {
			const {id, name, value} = this._stages[0].result()

			const answers = this._stages[1].result() || {}

			const {context} = global.currentScreen.currentState()
			const transformationRef = this._item.transformationRef
			const location = (toClipboard) ? Clipboard() : AsChildOf(context.filePath, context.range.start)


			const editorSlug = (context) ? context.editorSlug : undefined

			PostGenerateFromRelationshipRequest(
				transformationRef,
				value,
				id,
				name,
				undefined,
				location,
				answers,
				editorSlug)
		}
		resetToMain()
		super.finish()
	}

}

const finalizeText = (item, sourceName) => {

	const {context} = global.currentScreen.currentState()

	if (context) {
return `Ready to generate new {bold} ${item.toName}{/bold} from {bold}${sourceName}{/bold}

Insert location: {yellow-fg}${context.relativeFilePath} ${context.range.start}{/yellow-fg}
Press {green-fg}{bold}(return){/bold}{/green-fg} to insert
Press {green-fg}{bold}(c){/bold}{/green-fg} to copy to clipboard

Press {red-fg}{bold}(escape){/bold}{/red-fg} to cancel

`
	} else {
		return `Ready to generate new {bold} ${item.toName}{/bold} from {bold}${sourceName}{/bold}

Insert location: {yellow-fg}Clipboard. No file opened in a connected IDE {/yellow-fg}
Press {green-fg}{bold}(c){/bold}{/green-fg} to copy to clipboard

Press {red-fg}{bold}(escape){/bold}{/red-fg} to cancel

`
	}


}
