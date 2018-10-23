//fixes race condition caused when re-focusing a textbox
import {scrollContent} from "../components/Content";

export function AddBlurToTextBox(textBox, handlers) {

	textBox.inputFocus = () => {
		textBox.inputBlur()
		textBox.addHandlers()
		textBox.focus()
	}

	textBox.addHandlers = () => {
		handlers()
	}

	textBox.inputBlur = () => {
		textBox.removeListener('keypress', textBox.__listener);
		delete textBox.__listener;

		textBox.removeListener('blur', textBox.__done);
		delete textBox.__done;


		global.currentScreen._screen.focusPop(textBox)
	}
}
