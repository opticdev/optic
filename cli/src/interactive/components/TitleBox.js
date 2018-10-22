import {Child} from "../reactive-blessed/Child";
import blessed from "blessed";
import {lengthMinusTags} from "../util/LengthMinusTags";
import {shouldShowStatus, statusText} from "../constants/StatusText";
import {activeBlue, idleGreen} from "../constants/constants";

export const titleBox = () => new Child((initialState) => {
	const title =  blessed.box({
		top: 'top',
		left: 'center',
		width: '100%',
		content: '',
		height: 3,
		tags: true,
		border: {
			type: 'line'
		},
		style: {
			fg: 'default',
			border: {
				fg: idleGreen
			},
			hover: {
				bg: 'green'
			}
		}
	});

	return title
}, (node, newState) => {
	node.setContent(textFromState(newState, node))
})

function textFromState(state, node) {

	//override title bar when status updates come in
	if (shouldShowStatus(state.status)) {
		return statusText(state.status)
	}

	if (state.intent && state.intent.started) {
		if (state.intent.type === 'Modify') {
			node.style.border.fg = activeBlue
		}
		return state.intent.titleText()
	}

	node.style.border.fg = idleGreen //normal color

	const cols = state.width
	const segment1 =  ` Optic`
	const segment2 = (() => {
		if (state.ide) {
			return ''+state.ide
		} else {
			return '{red-fg}No IDE Connected{/}'
		}
	})()
	const spacer = ' '.repeat(cols - segment1.length - lengthMinusTags(segment2) - 3)

	return segment1 + spacer + segment2
}
