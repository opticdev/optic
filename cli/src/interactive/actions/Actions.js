import {contentModesEnum} from "../constants/ContentModes";
import {isPrimitiveField, readPrimitiveValue} from "../util/FieldInterpreter";
import featureFlags from '../../../features'
import {JSONArrayStack} from "../json-editor/JSONArrayStack";
import {GenerateIntent} from "../intent/GenerateIntent";
import {printState, printVisibleElements} from "../debuggers/commands";
import {GenerateFromRelationship} from "../intent/GenerateFromRelationship";
import {SyncIntent} from "../intent/SyncIntent";

export const actionHandler = (setState, getCurrentState) => {
	return {

		//Main Text Input

		onInputChanged(value, lastValue) {
			if (value !== '' && getCurrentState().contentMode !== contentModesEnum.SELECT_OBJECT) {
				setState({contentMode: contentModesEnum.EMPTY})
			}
		},
		onInputEnter() {
			// destructiveLogger(getCurrentState().contentMode)
			const {inputValue} = getCurrentState()
			switch (inputValue.trim().toLowerCase()) {
				case 'clear':
					setState({contentMode: contentModesEnum.EMPTY})
					break;
				case 'help':
					setState({contentMode: contentModesEnum.HELP, inputValue: ''})
					break;
				case 'sync':
					const sync = new SyncIntent()
					setState({contentMode: contentModesEnum.SYNC, inputValue: '', intent: sync})
					sync.start()
					break;
				case 'debug-cli-state':
					printState()
					break;
				case 'debug-visible-elements-state':
					printVisibleElements()
					break;
				default:
					if (getCurrentState().contentMode === contentModesEnum.EMPTY) {
						const searchItem = getCurrentState().selectedSearchItem
						if (searchItem) {
							const intent = searchItem.isTransformation ?
								new GenerateFromRelationship(searchItem) : new GenerateIntent(searchItem)
							setState({intent})
							intent.start()
							// destructiveLogger(intent)
						}
					} else if (getCurrentState().contentMode === contentModesEnum.SELECT_OBJECT) {
						const selectedObject = getCurrentState().selectedSearchItem
						if (selectedObject) {
							getCurrentState().intent.selectObject(selectedObject)
						}
					}
					break;
			}
		},


		//search results
		changeSelection(item, index) {
			setState({
				selectedSearchItem: item,
				selectedSearchIndex: index,
			})
		},

		//JSON Editor Input

		changeField(item, index) {
			const statePatch = {
				selectedItem: item,
				selectedIndex: index,
				emptyCollection: false
			}

			if (featureFlags['json-form']['default-input-is-last-value']) {
				if (item && item.schema && isPrimitiveField(item.schema)) {  //not sure if I want this
					statePatch.formInputValue = item.value || ''
				}
			}

			if (item === null) {
				statePatch.emptyCollection = true
			}

			setState(statePatch)
		},

		onNewFieldValueSet(field, value) {
			if (isPrimitiveField(field.schema)) {
				const parsedValue = readPrimitiveValue(value, field.schema.type)
				const {editorDisplayManager} = getCurrentState()
				editorDisplayManager.setValueOnHead(field.name, parsedValue)
				setState({formInputValue: ''})
			}
			global.currentScreen.getRawNodeById('jsonForm').down()

		},
		pushStack(field) {
			const {editorDisplayManager} = getCurrentState()
			const newStack = editorDisplayManager.getHead().stackForProperty(field, editorDisplayManager)
			if (newStack) {
				setState({})
			} else {
				destructiveLogger('could not push new editing stack')
			}

		},

		startConfirm() {
			const {editorDisplayManager} = getCurrentState()
			//skip confirm if valid
			if (editorDisplayManager.matchesSchema().isMatch) {
				editorDisplayManager.confirm()
			} else {
				editorDisplayManager.beginConfirm()
				editorDisplayManager.triggerRedraw()
				setState({})
			}
		},

		stopConfirm(didCancel) {
			const {editorDisplayManager} = getCurrentState()
			if (didCancel) {
				editorDisplayManager.closeConfirm()
			} else {
				editorDisplayManager.confirm()
			}
			editorDisplayManager.triggerRedraw()
			setState({})
		},

		popStack() {
			const {editorDisplayManager} = getCurrentState()
			if (editorDisplayManager.getHead().canPop()) {
				editorDisplayManager.getHead().pop(editorDisplayManager)
			}
			setState({})
		},

		//Array Editor Input

		moveItem(down) {
			const {editorDisplayManager, selectedIndex} = getCurrentState()
			const arrayManager = editorDisplayManager.getHead()
			arrayManager.moveItem(selectedIndex, down)
			arrayManager.pushChangesUpStack(editorDisplayManager)
			editorDisplayManager.triggerRedraw()
			setState({})

			const fieldsList = global.currentScreen.getRawNodeById('jsonForm')
			if (down) {
				fieldsList.down()
			} else {
				fieldsList.up()
			}
		},

		deleteItem(removalIndex) {
			const {editorDisplayManager, selectedItem} = getCurrentState()
			if (editorDisplayManager.nonEmpty && editorDisplayManager.getHead() instanceof JSONArrayStack) {
				const arrayManager = editorDisplayManager.getHead()
				arrayManager.removeItem(removalIndex)
				arrayManager.pushChangesUpStack(editorDisplayManager)
				editorDisplayManager.triggerRedraw()
				setState({})
			}
		},
		addItem(atIndex = 0) {
			const {editorDisplayManager} = getCurrentState()
			const arrayManager = editorDisplayManager.getHead()

			arrayManager.addItem(arrayManager.validNewPlaceholderValue(), atIndex)
			const newStack = editorDisplayManager.getHead().stackForProperty(atIndex, editorDisplayManager)

			arrayManager.pushChangesUpStack(editorDisplayManager)

			if (newStack) {
				setState({})
			} else {
				destructiveLogger('could not push editing stack for added item')
			}

		}
	}
}
