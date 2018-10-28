import blessed from "blessed";
import {Child} from "../reactive-blessed/Child";
import {contentModesEnum} from "../constants/ContentModes";
import {searchList} from "./SearchList";
import {atBottomAndDown, jsonForm} from "./form/JSONForm";
import {toggleOnAssertion} from "../util/ToggleOnAssertion";
import {topFormHelp} from "./form/TopFormHelp";
import {indicatorContent} from "./IndicatorContent";
import {standardHelp} from "../../Cli";

let lastState = {}
let lastIsConfirm = false

export const content = () => new Child((initialState, setState, actionHandler) => {
		const box = blessed.box({
			border: 'line',
			style: {
				fg: 'blue',
				bg: 'default',
				bar: {
					bg: 'default',
					fg: 'blue'
				},
				border: {
					fg: 'default',
					bg: 'default'
				}
			},
			width: '100%',
			height: '100%-6',
			padding: 0,
			left: 0,
			top: 3,
			scrollable: true,
			keys: true,
			alwaysScroll: true,
			scrollbar: {
				ch: ' ',
				inverse: false
			}
		})

		return box;

	},
	(node, newState, screen, nodeWrapper) => {
		const isConfirm = contentModesEnum.JSON_INPUT === newState.contentMode && newState.editorDisplayManager.confirming

		if (lastState.contentMode !== newState.contentMode || lastIsConfirm !== isConfirm) {

			setTimeout(() => {
				global.currentScreen.getRawNodeById('contentRegion').scrollTo(0)
			}, 1)

			//hide / show each individual panel
			toggleOnAssertion(newState.contentMode === contentModesEnum.EMPTY, 'searchList', screen)
			toggleOnAssertion(newState.contentMode === contentModesEnum.JSON_INPUT && !isConfirm, 'jsonForm', screen)

			node.setContent(contentForMode(newState))
		}

		lastState = newState
		lastIsConfirm = isConfirm

	},
	[
		indicatorContent(),
		searchList(),
		jsonForm(),
		topFormHelp(),
	],
	'contentRegion'
)

function contentForMode(state) {
	switch (state.contentMode) {
		case contentModesEnum.HELP:
			return standardHelp()
			break;
		default:
			return ''
			break;
	}
}

export function scrollContent(downBool) {
	const region = global.currentScreen.getRawNodeById('contentRegion')
	//needed for some reason

	switch (global.currentScreen.currentState().contentMode) {
		case contentModesEnum.HELP:
			global.currentScreen.setState({scrollpos: region.getScroll()})
			if (region) {
				const current = region.getScroll()
				if (downBool) {
					region.scroll(1)
				} else {
					region.scroll(-1)
				}
			}
			break;
		case contentModesEnum.EMPTY:
		case contentModesEnum.SELECT_OBJECT:
			const searchList = global.currentScreen.getRawNodeById('searchList')
			if (searchList) {
				// destructiveLogger(searchList)
				if (downBool) {
					searchList.down(1)
				} else {
					searchList.up(1)
				}
				global.currentScreen.render()
			}
			break;

		case contentModesEnum.JSON_INPUT:
			const fieldsList = global.currentScreen.getRawNodeById('jsonForm')
			const {selectedIndex} = global.currentScreen.currentState()

			if (fieldsList) {
				if (downBool) {
					fieldsList.down(1)
				} else {
					fieldsList.up(1)
				}
				global.currentScreen.render()
			}
			break;
	}
}

