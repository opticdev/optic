import {Screen} from "./reactive-blessed/Screen";
import blessed from "blessed";
import {Child} from "./reactive-blessed/Child";
import {titleBox} from "./components/TitleBox";
import {content} from "./components/Content";
import {bottomInput, bottomInputLabel} from "./components/BottomInput";
import {bottomHelp} from "./components/BottomHelp";
import {actionHandler} from "./actions/Actions";
import {contentModesEnum} from "./constants/ContentModes";
import {bottomFormInput} from "./components/form/BottomFormInput";
import {bottomFormHelp} from "./components/form/BottomFormHelp";
import {routeSchema, simpleSchema} from "./json-editor/test/ExampleSchemas";
import {EditorDisplayManager} from "./json-editor/EditorDisplayManager";
import {agentConnection} from "../optic/AgentSocket";
import equals from 'equals'
import {BlurTextBox} from "./blessed-extensions/BlurTextBox";
import {setStatus} from "./actions/StateMutations";
import {ModifyIntent} from "./intent/ModifyIntent";
import clipboardy from 'clipboardy'
import colors from "colors";
import config from "../config";
import {initStorage} from "../Storage";

const storage = initStorage()

global.destructiveLogger = (log) => {
	if(global.currentScreen) {
		global.currentScreen._screen.destroy()
	}
	console.log(log)
	process.exit(0)
}

const editorDisplayManager = new EditorDisplayManager()

const defaultState = {
	inspectMode: false,
	inputValue: '',
	ide: '',
	context: null,
	contentMode: contentModesEnum.EMPTY,
	editorDisplayManager,
	formInputValue: '',
	knowledgeGraph: {nodes: [], edges: []},
	objectSelectionOptions: [],
	intent: null
}

export function shouldStart() {
	return new Promise((resolve, reject) => {
		const agentC = agentConnection(() => {
			resolve()
		})

		agentC.onError((e) => {
			console.error(colors.red(`Current directory does not include Optic project. Run 'optic init' to create one`))
			process.exit(0)
		})
	})
}

export function startInteractive(initialState = {}) {

	shouldStart().then(() => {

	global.currentScreen = new Screen(
		//children
		[
			titleBox(),
			content(),
			bottomHelp(),
			bottomInput(),
			bottomFormInput(),
			bottomFormHelp()
		],
		//initial state
		{
			...defaultState,
			...initialState
		},
		actionHandler
	)

	global.currentScreen.addHandlers((screenInstance, getState, setState, actionHandler) => {

		screenInstance.key(['C-c'], (ch, key) => {
			return process.exit(0);
		});

		screenInstance.on('resize', () => {
			setState({
				width: screenInstance.width,
				height: screenInstance.height
			})
		})


		screenInstance.key(['escape', 'return'], (ch, key) => {
			const {editorDisplayManager} = getState()
			if (editorDisplayManager.confirming) {
				if (key.name === 'escape') {
					actionHandler.stopConfirm(true)
				} else {
					actionHandler.stopConfirm()
				}
			}
		})

		agentConnection(() => {
			setState({ide: 'Connected, No IDE'})
		})

		agentConnection().onContextFound((data) => {

			if (!getState().inspectMode) {
				return
			}

			if (data.results.models.length) {

				const currentIntent = getState().intent
				if (currentIntent && currentIntent.type === 'Modify') {
					currentIntent.finish()
				}

				const contextItem = data.results.models[0]
				const modifyIntent = new ModifyIntent(contextItem)
				setState({
					context: data,
					contextItem,
					ide: `Connected to ${data.editorSlug}`,
					intent: modifyIntent
				})

				modifyIntent.start()
			} else {
				const currentIntent = getState().intent
				if (currentIntent && currentIntent.type === 'Modify') {
					currentIntent.finish()
				}
				setState({
					context: data,
					contextItem: null,
					ide: `Connected to ${data.editorSlug}`,
					intent: null
				})
			}
		})

		agentConnection().onStatusChange(({status}) => setStatus(setState, getState, status))

		agentConnection().onKnowledgeGraphUpdate(({knowledgeGraph}) => {
			setState({knowledgeGraph})
		})

		agentConnection().onCopyToClipboard(({text}) => clipboardy.write(text))

	})

	global.currentScreen.render()


	const input = global.currentScreen.getRawNodeById('bottomInput')
	input.inputFocus()

	})
}

//override for testing
if (process.argv[2] === 'interactive-test-protocol') {
	startInteractive()
}
