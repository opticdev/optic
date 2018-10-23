import {IntentBase} from "./base/IntentBase";
import {JSONStage} from "./stages/JSONStage";
import {routeSchema} from "../json-editor/test/ExampleSchemas";
import {IndicatorStage} from "./stages/IndicatorStage";
import {resetToMain} from "../actions/StateMutations";
import {AsChildOf, Clipboard} from "../../optic/PostChangesInterfaces";
import {PostGenerateRequest} from "../../optic/PostChanges";

export class GenerateIntent extends IntentBase {
	constructor(searchItem) {

		super({stages: [
			new JSONStage({
				initialValue: {},
				schema: routeSchema
			}),
			new IndicatorStage(() => {
				const jsonStage = this.stages[0]

				const hasContext = !!global.currentScreen.currentState().context

				return {
					text: finalizeText(jsonStage.result()),
					keyBindings: {
						'escape': () => this.finish(),
						'return': () => this.finish(true, !hasContext),
						'c': () => this.finish(true, true)
					}
				}
			})

		], item: searchItem})

		this.type = 'Generate'
	}

	titleText() {
		return ` Generating new {bold}${this._item.name}{/bold}`
	}

	finish(generate, toClipboard) {
		if (generate) {
			const {context} = global.currentScreen.currentState()
			const schemaRef = (this._item.type === 'lens') ? this._item.schemaRef : this._item.id
			const lensRef =  (this._item.type === 'lens') ? this._item.id : undefined
			const {value} = this._stages[0].result()
			const location = (toClipboard) ? Clipboard() : AsChildOf(context.filePath, context.range.start)

			PostGenerateRequest(schemaRef, value, lensRef, location, (context) ? context.editorSlug : undefined)

		}
		resetToMain()
		super.finish()
	}
}

const finalizeText = (json, title) => {

const {context} = global.currentScreen.currentState()

if (context) {
return `
{bold}Ready to generate new ${title}{/bold}

Insert location: {yellow-fg}${context.relativeFilePath} ${context.range.start}{/yellow-fg}
Press {green-fg}{bold}(return){/bold}{/green-fg} to insert
Press {green-fg}{bold}(c){/bold}{/green-fg} to copy to clipboard

Press {red-fg}{bold}(escape){/bold}{/red-fg} to cancel

${JSON.stringify(json.value, null, 2)}

`
} else {
return `
{bold}Ready to generate new ${title}{/bold}

Insert location: {yellow-fg}Clipboard. No file opened in a connected IDE {/yellow-fg}
Press {green-fg}{bold}(c){/bold}{/green-fg} to copy to clipboard

Press {red-fg}{bold}(escape){/bold}{/red-fg} to cancel

${JSON.stringify(json.value, null, 2)}

`
}


}
