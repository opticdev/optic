
import {Child} from "../../reactive-blessed/Child";
import blessed from "blessed";
import {exampleFieldValues} from "../../constants/test/ExampleFields";
import equals from 'equals'
import Stack from "../../json-editor/Stack";
import {listFromFields} from "../../json-editor/StackGUIHelpers";
import {scrollContent} from "../Content";
import {isArrayField, isObjectField} from "../../util/FieldInterpreter";
import {JSONArrayStack} from "../../json-editor/JSONArrayStack";
import {toggleNoneOnAssertion} from "../../util/ToggleOnAssertion";
import {contentModesEnum} from "../../constants/ContentModes";


let lastSessionId = null
let lastStack = null

export const jsonForm = () => new Child((initialState, setState, actionHandler) => {
	const list =  blessed.list({
		style: {
			item: {
				size: 20
			},
			fg: 'blue',
			bg: 'default',
		},
		width: '100%',
		height: '100%-3',
		left: 0,
		top: 1,
		items: [],
		keys: true,
	})

	list.on('select item', (item, index) => {

		const currentState = global.currentScreen.currentState()
		const displayManager = currentState.editorDisplayManager
		const displayState = displayManager.displayState()
		if (displayState.fields.length) {
			const field = displayState.fields[index]
			actionHandler.changeField(field, index)
		} else {
			actionHandler.changeField(null, 0)
		}
	})

	list.on('keypress', (ch, key) => {
		const currentState = global.currentScreen.currentState()

		const isArrayStack = currentState.editorDisplayManager.nonEmpty && currentState.editorDisplayManager.getHead() instanceof JSONArrayStack

		if (isArrayStack && key.name !== 'enter') {
			if (key.name === 'backspace') {
				const selectedIndex = currentState.selectedIndex
				actionHandler.deleteItem(selectedIndex)
				return false
			}

			if (key.name === 'a') {
				const selectedIndex = currentState.selectedIndex
				actionHandler.addItem(selectedIndex)
				return false;
			}
		}

		if (isArrayStack) {
			if (key.name === 'w') {
				actionHandler.moveItem(false)
				return false;
			}

			if (key.name === 's') {

				actionHandler.moveItem(true)
				return false;
			}
		}

		if (key.name === 'right') {
			const currentField = currentState.selectedItem
			const currentIndex = currentState.selectedIndex
			if (currentField) {
				if (isArrayField(currentField.schema)) {
					actionHandler.pushStack(currentField.name)
				} else if (isObjectField(currentField.schema)) {
					actionHandler.pushStack(currentField.order)
				}
			}
		}
	})

	list.key(['C-f'], (ch, key) => startConfirm(actionHandler));

	list.key(['C-c'], (ch, key) => {
		return process.exit(0);
	});

	list.key(['left'], (ch, key) => {
		actionHandler.popStack()
	});

	return list

}, (node, newState, screen, nodeWrapper) => {
	toggleNoneOnAssertion((newState.contentMode === contentModesEnum.JSON_INPUT) && !newState.editorDisplayManager.confirming && !newState.indicator, node)
	const sessionId = newState.editorDisplayManager.sessionId()
	if (lastSessionId !== sessionId) {
		//display schema values
		const displayManager = newState.editorDisplayManager

		if (displayManager.nonEmpty) {
			const displayState = displayManager.displayState()
			const fieldStrings = displayState.fieldsStrings

			if (displayManager.confirming) {
				node.hide()
			} else {
				node.show()
			}

			if (fieldStrings.length) {
				node.style.selected.fg = 'default'
				node.setItems(fieldStrings)
			} else {
				node.style.selected.fg = 'red'
				node.setItems(['Empty Collection'])
			}

			if (lastStack !== displayManager.getHead()) {
				setTimeout(() => {
					node.select(0)
					global.currentScreen
						.setState({
								selectedItem: displayState.fields[0],
								selectedIndex: 0,
								emptyCollection: displayState.fields.length === 0
						})
				}, 1)
				lastStack = displayManager.getHead()
			}
		}

		lastSessionId = sessionId
	}

}, [],
'jsonForm'
)


export const startConfirm = (actionHandler) => {
	const currentState = global.currentScreen.currentState()
	if (currentState.editorDisplayManager.isRoot) {
		actionHandler.startConfirm()
	}
}
