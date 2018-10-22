import blessed from "blessed";
import {Child} from "./Child";

//react - like interface
export class Screen {
	constructor(children = [], initialState = {}, actionHandler = () => {}) {
		this._screen = blessed.screen({
			smartCSR: true,
			title: 'Optic'
		});

		this._children = children

		this._state = {
			...initialState,
			width: this._screen.width,
			height: this._screen.height
		}

		this.setState = this.setState.bind(this)
		this.currentState = this.currentState.bind(this)
		this.addHandlers = this.addHandlers.bind(this)
		this.registerChild = this.registerChild.bind(this)
		this.getRawNodeById = this.getRawNodeById.bind(this)
		this.clearFocus = this.clearFocus.bind(this)

		this._actionHandler = actionHandler(this.setState, this.currentState)
		this._idStore = {}

		children.forEach((i) => {

			if (!i.currentInstance()) {
				i.newInstance(this)
				this._screen.append(i.currentInstance())
			}

			this._screen.append(i.currentInstance())

		})

	}

	registerChild(child) {
		if (!child instanceof Child) {
			throw new Error('only Child objects can be registered')
		}

		if (child._id) {
			this._idStore[child._id] = child
		}

	}

	getRawNodeById(id) {
		if (this._idStore.hasOwnProperty(id)) {
			return this._idStore[id].currentInstance()
		}
	}

	setState(newState) {
		this._state = {
			...this._state,
			...newState
		}

		this.render()
	}

	currentState() {
		return this._state
	}

	addHandlers(handlerInit) {
		handlerInit(this._screen, this.currentState, this.setState, this._actionHandler)
	}

	render() {
		//map global state to children
		this._children.forEach((i) => i.updateState(this))
		//re-render
		this._screen.render()
	}

	clearFocus() {
		while (this._screen.focused) {
			this._screen.focusPop(this._screen.focused)
		}
	}

}
