import {Child} from "../../reactive-blessed/Child";
import blessed from "blessed";
import {toggleNoneOnAssertion} from "../../util/ToggleOnAssertion";
import {contentModesEnum} from "../../constants/ContentModes";
import {fieldPredicates} from "../../json-editor/FieldPredicates";
import {JSONArrayStack} from "../../json-editor/JSONArrayStack";

export const bottomFormHelp = () => new Child((initialState, setState) => {
	const box = blessed.box({
		style: {
			fg: 'default',
			bar: {
				bg: 'default',
				fg: 'blue'
			}
		},
		width: '100%',
		tags: true,
		hidden: false,

		height: 2,
		content: chooseStyle(initialState),
		left: 0,
		bottom: 1,
	});

	return box

}, (node, newState) => {
	node.setContent(chooseStyle(newState))
	toggleNoneOnAssertion(newState.contentMode === contentModesEnum.JSON_INPUT, node)
}, [],
	'bottomFormHelp')


//Help Messages
const stringMessage =  'enter string, press {bold}Enter{/bold} \n enum: [a, b, c, d, e, f]'
const defaultStyle =  'string'

//UI Logic
const chooseStyle = (state) => {
	const field
		= state.selectedItem

	if (state.editorDisplayManager.confirming) {
		if (state.editorDisplayManager.confirmState().isValid) {
			return 'Press {bold}(return){/bold} to finish \n      {bold}(esc){/bold} to go back'
		} else {
			return 'Press {bold}(esc){/bold} to go back'
		}
	}

	//give array controls at the bottom
	if (state.editorDisplayManager.nonEmpty && state.editorDisplayManager.getHead() instanceof JSONArrayStack) {
		return 'press {bold}(a){/bold} to add an item, {bold}(→){/bold} to edit item, {bold}(delete){/bold} to remove\n {bold}(w/s){/bold} to rearrange'
	}

	if (field) {
		const fieldIf = fieldPredicates(field.schema)
		if (fieldIf.isString()) {
			if (fieldIf.hasEnum()) {
				return `enter string, press {bold}(return){/bold} \n enum: ${JSON.stringify(field.schema.enum)}`
			} else {
				return 'enter string, press {bold}(return){/bold}'
			}
		}

		if (fieldIf.isArray()) {
			return `press {bold}→{/bold} to edit array`
		}

	}
}
