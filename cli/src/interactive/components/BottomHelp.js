import {Child} from "../reactive-blessed/Child";
import blessed from "blessed";
import {toggleNoneOnAssertion} from "../util/ToggleOnAssertion";
import {contentModesEnum} from "../constants/ContentModes";
import {contextHelpText} from "../constants/ContextText";

//Help Messages
const defaultStyle =  'type a query, {bold}sync{/bold}, or {bold}help{/bold}'

//UI Logic
const isEmpty = (state) => !!state.inputValue


const chooseStyle = (state) => {

	if (state.indicator) {
		return state.indicator.bottomHelp || ''
	}

	if (isEmpty(state)) {
		return ''
	} else {
		return defaultStyle
	}
}

export const bottomHelp = () => new Child((initialState, setState) => {
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
		height: 2,
		content: chooseStyle(initialState),
		left: 0,
		bottom: 1,
	});

	return box

}, (node, newState) => {
	node.setContent(chooseStyle(newState))
	toggleNoneOnAssertion(newState.contentMode !== contentModesEnum.JSON_INPUT, node, node)},
[],
'bottomHelp')
