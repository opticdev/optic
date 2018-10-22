import {contentModesEnum} from "../constants/ContentModes";
import equals from "equals";
import {ModifyIntent} from "../intent/ModifyIntent";

export function resetToMain() {
	global.currentScreen.setState({contentMode: contentModesEnum.EMPTY, inputValue: ''})
	setTimeout(() => {
		const input = global.currentScreen.getRawNodeById('bottomInput')
		input.inputFocus()
	}, 1)
}

export function setStatus(setState, getState, status) {
	setState({status})
	setTimeout(() => { //show alerts for 3 seconds and then hide...unless error.
		if (equals(getState().status, status) && !status.hasErrors) {
			setState({status: null})
		}
	}, 3000)
}
