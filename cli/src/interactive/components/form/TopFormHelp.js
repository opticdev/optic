import {Child} from "../../reactive-blessed/Child";
import blessed from "blessed";
import {toggleNoneOnAssertion} from "../../util/ToggleOnAssertion";
import {contentModesEnum} from "../../constants/ContentModes";
import {fieldPredicates} from "../../json-editor/FieldPredicates";
import {lengthMinusTags} from "../../util/LengthMinusTags";
import {confirmText} from "../../constants/Confirm";

let lastConfirming = false

export const topFormHelp = () => new Child((initialState, setState, actionHandler) => {
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
			height: 1,
			content: chooseStyle(initialState),
			left: 0,
			top: 0,
			scrollable: true,
			keys: true,
			alwaysScroll: true,
		});

		box.key(['escape', 'return'], (ch, key) => {
			const {editorDisplayManager} = global.currentScreen.currentState()
			if (editorDisplayManager.confirming) {
				if (key.name === 'escape') {
					actionHandler.stopConfirm(true)
				} else {
					actionHandler.stopConfirm()
				}
			}
		})

		return box

	}, (node, newState) => {
		node.setContent(chooseStyle(newState, node))
		toggleNoneOnAssertion(newState.contentMode === contentModesEnum.JSON_INPUT, node)

		if (lastConfirming !== newState.editorDisplayManager.confirming) {
			if (newState.editorDisplayManager.confirming) {
				node.height = '95%'
				setTimeout(() => {
					node.focus()
				}, 1)
			} else {
				node.height = 1
				setTimeout(() => {
					global.currentScreen.getRawNodeById('contentRegion').scrollTo(0)
				}, 1)
			}

			lastConfirming = newState.editorDisplayManager.confirming
		}

	}, [],
	'topFormHelp')


//Help Messages
//UI Logic
const chooseStyle = (state, node) => {
	const cols = state.width
	const displayManager = state.editorDisplayManager

	if (displayManager.nonEmpty) {
		if (displayManager.getHead().getAbsolutePath()) {
			const segment1 = displayManager.getHead().getAbsolutePath() + ' {bold}(press ←){/}'

			const spacer = ' '.repeat(cols - lengthMinusTags(segment1) - 3)
			return spacer + segment1
		} else if (displayManager.confirming) {
			const confirmState = displayManager.confirmState()
			return confirmText(confirmState)
		} else if (displayManager.isRoot) {
			const segment1 = 'Press {bold}Ctrl+F{/bold} to finish'
			const spacer = ' '.repeat(cols - lengthMinusTags(segment1) - 3)
			return spacer + segment1
		}
	}
}
