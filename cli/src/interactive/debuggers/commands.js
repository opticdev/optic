import deepCopy from 'deepcopy'

export function printState() {
	const obj = deepCopy(global.currentScreen.currentState())
	obj.knowledgeGraph = '[excluded]'
	destructiveLogger(JSON.stringify(obj, null, 2))
}

export function printVisibleElements() {
	const visible = [
		'searchList',
		'indicatorContent',
		'contentRegion',
		'bottomInput',
		'bottomHelp',
		'topFormHelp',
		'jsonForm',
		'bottomFormInput',
		'bottomFormHelp'
	].filter((i) => !global.currentScreen.getRawNodeById(i).hidden)

	destructiveLogger(JSON.stringify(visible, null, 2))
}
