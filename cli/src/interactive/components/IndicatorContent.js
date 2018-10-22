import blessed from "blessed";
import {Child} from "../reactive-blessed/Child";
import {atBottomAndDown, jsonForm} from "./form/JSONForm";
import {toggleNoneOnAssertion, toggleOnAssertion} from "../util/ToggleOnAssertion";
import {contentModesEnum} from "../constants/ContentModes";

let lastIndicator = false

export const indicatorContent = () => new Child((initialState, setState, actionHandler) => {
		const box = blessed.box({
			style: {
				fg: 'default',
				bg: 'default',
			},
			width: '100%-6',
			height: '100%-1',
			left: 0,
			top: 0,
			scrollable: true,
			keys: true,
			hidden: true,
			tags: true,
			alwaysScroll: true,
			scrollbar: {
				ch: ' ',
				inverse: false
			}
		})

		box.on('keypress', (ch, key) => {
			const {keyBindings} = global.currentScreen.currentState().indicator
			const binding = keyBindings[key.name]
			if (typeof binding === 'function') {
				binding(ch, key)
			}
		})

		return box;

	},
	(node, newState, screen, nodeWrapper) => {

		const hasIndicator = !!newState.indicator

		if (lastIndicator !== hasIndicator) {
			toggleNoneOnAssertion(hasIndicator, node, () => {
				node.setContent(newState.indicator.text)
			})

			setTimeout(() => {
				global.currentScreen.getRawNodeById('contentRegion').scrollTo(0)
				global.currentScreen.getRawNodeById('indicatorContent').scrollTo(0)
			}, 1)

			lastIndicator = hasIndicator
		}

		if (hasIndicator) {
			setTimeout(() => {
				global.currentScreen.getRawNodeById('contentRegion').scrollTo(0)
				global.currentScreen.getRawNodeById('indicatorContent').scrollTo(0)
				node.focus()
			}, 1)
		}

	},
	[],
	'indicatorContent'
)
