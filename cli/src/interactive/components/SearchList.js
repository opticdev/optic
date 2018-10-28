import {Child} from "../reactive-blessed/Child";
import blessed from "blessed";
import fuzzy from 'fuzzy'
import equals from 'equals'
import {fuzzySearch} from "../util/FuzzySearch";
import {toggleOnAssertion} from "../util/ToggleOnAssertion";
import {contentModesEnum} from "../constants/ContentModes";

let lastItems = {}

export const searchList = () => new Child((initialState, setState, actionHandler) => {
		const list =  blessed.list({
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
			height: '100%-2',
			left: 0,
			top: 0,
			items: [],
			keys: true,
		})

		list._itemObjects = []

		list.on('select item', (item, index) => {
			if (list._itemObjects.length) {
				const field = list._itemObjects[index]
				actionHandler.changeSelection(field, index)
			} else {
				actionHandler.changeSelection(null, 0)
			}
		})

		return list
	},
	(node, newState, screen, nodeWrapper) => {

		toggleOnAssertion((
			contentModesEnum.EMPTY === newState.contentMode || contentModesEnum.SELECT_OBJECT === newState.contentMode)
			&& !newState.indicator, 'searchList', screen)

		const searchResults = (() => {
			if (contentModesEnum.SELECT_OBJECT === newState.contentMode) {
				return objectSelectionOptionsToSearchResults(newState.objectSelectionOptions)
			} else {
				return knowledgeGraphToSearchResults(newState.inputValue, newState.knowledgeGraph)
			}
		})()

		const filteredResults = fuzzySearch(newState.inputValue, searchResults)

		if (newState.objectSelectionOptions.length) {
			// destructiveLogger(searchResults)
		}

		if (!equals(lastItems, filteredResults)) {
			node.clearItems()
			node.setItems(filteredResults.strings)
			node._itemObjects = filteredResults.objects
			lastItems = filteredResults
			setTimeout(() => {
				node.select(0)
				global.currentScreen
					.setState({
						selectedSearchItem: (filteredResults.objects) ? filteredResults.objects[0] : null,
						selectedSearchIndex: 0,
					})
			}, 1)
		}
	},
	[],
	'searchList'
)


const knowledgeGraphToSearchResults = (inputValue, knowledgeGraph) => {

	const nodes = knowledgeGraph.nodes.filter((i) => !i.internal && i.name.includes(' '))
	const relationships = knowledgeGraph.edges.filter((i) => i.isTransformation)

	const array = nodes.map((i) => {
		i._string = `○ ${i.name}`
		return i
	}).concat(relationships.map((i) => {
		i._string = `↦ ${i.label.name}`
		return i
	}))

	return array

}

const objectSelectionOptionsToSearchResults = (results) => {
	results.forEach((i) => i._string = i.name)
	return results
}
