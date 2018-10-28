import blessed from "blessed";
import {Child} from "../../reactive-blessed/Child";
import {toggleNoneOnAssertion, toggleOnAssertion} from "../../util/ToggleOnAssertion";
import {contentModesEnum} from "../../constants/ContentModes";
import {scrollContent} from "../Content";
import {isPrimitiveField} from "../../util/FieldInterpreter";
import {startConfirm} from "./JSONForm";

let lastValue = ''

export const bottomFormInput = () => new Child((initialState, setState, actionHandler) => {
	const input =  blessed.textbox({
		style: {
			fg: 'default',
			bar: {
				bg: 'default',
				fg: 'blue'
			}
		},
		width: '100%',
		height: 1,
		left: 0,
		bottom: 0,
		hidden: false,
		value: initialState.formInputValue,
		// vi: true,
		keys: true,
		inputOnFocus: true
	});

	input.on('keypress', (ch, key) => {

		if (key.name === 'enter') {
			const field = global.currentScreen.currentState().selectedItem
			setTimeout(() => {
				actionHandler.onNewFieldValueSet(field, input.getValue())
			}, 1)
			return false;
		}

		if (key.name === 'up' || key.name === 'down') {
			scrollContent(key.name === 'down')
			return false;
		}

		setTimeout(() => {
			const value = input.getValue()
			setState({formInputValue: value})
			lastValue = value
		}, 1) //can run anytime after this in event loop
	})

	input.key(['C-c'], (ch, key) => {
		return process.exit(0);
	});

	input.key(['C-f'], (ch, key) => startConfirm(actionHandler));

	input.key(['left'], (ch, key) => {
		actionHandler.popStack()
	});

	return input
}, (node, newState) => {

	const confirmingMode = newState.editorDisplayManager.confirming

	toggleNoneOnAssertion(newState.contentMode === contentModesEnum.JSON_INPUT && !confirmingMode && !newState.indicator, node, () => {

		node.setValue(newState.formInputValue)

		global.currentScreen.clearFocus()

		if (confirmingMode) {
			return
		}

		if (newState.emptyCollection) {
			global.currentScreen.clearFocus()
			global.currentScreen.getRawNodeById('jsonForm').focus()
			node.hide()
			return
		}

		//only show for primitive inputs
		if (!!newState.selectedItem && newState.contentMode === contentModesEnum.JSON_INPUT) {
			if (isPrimitiveField(newState.selectedItem.schema)) {
				node.show()
				node.focus()
			} else {
				global.currentScreen.clearFocus()
				global.currentScreen.getRawNodeById('jsonForm').focus()
				node.hide()
			}
		}
	})

}, [],
	'bottomFormInput')
