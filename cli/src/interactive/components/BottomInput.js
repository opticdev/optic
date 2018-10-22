import blessed from "blessed";
import {Child} from "../reactive-blessed/Child";
import {scrollContent} from "./Content";
import {toggleNoneOnAssertion} from "../util/ToggleOnAssertion";
import {contentModesEnum} from "../constants/ContentModes";
import {AddBlurToTextBox} from "../blessed-extensions/BlurTextBox";

let lastValue = ''

export const bottomInput = () => new Child((initialState, setState, actionHandler) => {
	const input =  blessed.textbox({
		style: {
			fg: 'default',
			bg: '#e2e2e2',
			bar: {
				bg: 'default',
				fg: 'blue'
			}
		},
		width: '100%',
		height: 1,
		left: 0,
		bottom: 0,
		value: initialState.inputValue,
		// vi: true,
		keys: true,
		inputOnFocus: true,
		autoFocus: true
	});

	AddBlurToTextBox(input, () => {
		input.on('keypress', (ch, key) => {
			if (key.name === 'enter') {
				input.focus()
				actionHandler.onInputEnter()
				return false;
			}

			if (key.name === 'up' || key.name === 'down') {
				scrollContent(key.name === 'down')
				return false;
			}

			setTimeout(() => {
				const value = input.getValue()
				setState({inputValue: value})
				actionHandler.onInputChanged(value, lastValue)
				lastValue = value
			}, 1) //can run anytime after this in event loop
		})
	})

	return input
}, (node, newState) => {
	node.setValue(newState.inputValue)
	toggleNoneOnAssertion(newState.contentMode !== contentModesEnum.JSON_INPUT && !newState.indicator, node)
}, [],
	'bottomInput')
