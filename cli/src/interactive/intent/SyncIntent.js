import {IntentBase} from "./base/IntentBase";

import {IndicatorStage} from "./stages/IndicatorStage";
import {resetToMain} from "../actions/StateMutations";
import {agentConnection} from "../../optic/AgentSocket";
import {startServer} from "../web-ui/server/server";
import {contextHelpText} from "../constants/ContextText";
import {PostSyncChangesRequest} from "../../optic/PostChanges";

export class SyncIntent extends IntentBase {
	constructor() {

		const context = global.currentScreen.currentState().context

		super({stages: [
			new IndicatorStage(() => {
				return {
					text: preparingPatch,
					keyBindings: {
						'escape': () => this.finish()
					},
					bottomHelp: 'Press {bold}(escape){/bold} to cancel'
				}
			}),
			new IndicatorStage(() => {
				return {
					text: patchText(this._patch),
					keyBindings: {
						'escape': this.finish,
						'space': this.displayInWeb
					},
					bottomHelp: 'Press {bold}(space){/bold} to view PR\nPress {bold}(escape){/bold} to cancel'
				}
			})

		], item: null})

		this.receivePatch = this.receivePatch.bind(this)
		this.displayInWeb = this.displayInWeb.bind(this)
		this.type = 'Generate'

		//trigger & listen for patch
		agentConnection().onSyncStaged(this.receivePatch, true)
		agentConnection().actions.getSyncPatch((context) ? context.editorSlug : 'none')

	}

	displayInWeb() {
		startServer(this._patch, (changes) => this.finish(true, changes))
	}

	receivePatch(data) {
		this._patch = data.patch
		this.next()
	}

	titleText() {
		return `{bold}Optic Sync{/bold}`
	}

	finish(apply, changes) {
		if (apply) {
			PostSyncChangesRequest(changes)
		}

		resetToMain()
		super.finish()
	}
}

const preparingPatch =`
{yellow-fg}Preparing patch (this can take a few seconds)...{yellow-fg}	
`

const triggersText = (patch) => {
if (patch.triggers.length) {
return `
{bold}Triggers:{/bold}

${patch.triggers.map((trigger) => {
	const bullets = trigger.changes.map((i) => `  - ${i}`).join('\n')
	return `Changes made to'${trigger.name}' require updates to \n${bullets}`
})}

`
} else {
return ''
}
}

const warningsText = (patch) => {
if (patch.warnings.length) {
return `
{bold}{yellow-fg}Warnings:{/yellow-fg}{/bold}
${patch.warnings.map((i) => `- ${i}`).join('\n')}
`
} else {
return ''
}
}

const errorsText = (patch) => {
	if (patch.errors.length) {
return `
{bold}{red-fg}Errors:{/red-fg}{/bold}
${patch.errors.map((i) => `- ${i}`).join('\n')}
`
} else {
return ''
}
}

const patchText = (patch) => {
if (!patch.changes.length) {
return `
No Changes Suggested

${warningsText(patch)}
${errorsText(patch)}
`
} else {
return `
Optic Suggests Changes

${triggersText(patch)}
${warningsText(patch)}
${errorsText(patch)}

`
}

}
