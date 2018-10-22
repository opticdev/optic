export class Child {
	constructor(initializer, mapState = () => {}, defaultChildren = [],  id) {
		this.initializer = initializer
		this.mapState = mapState
		this._blessedInstance
		this._id = id

		this.newInstance = this.newInstance.bind(this)
		this.addChild = this.addChild.bind(this)
		this.currentInstance = this.currentInstance.bind(this)
		this.addChildren = this.addChildren.bind(this)
		this.removeAllChildren = this.removeAllChildren.bind(this)
		this.updateState = this.updateState.bind(this)

		this._children = defaultChildren
	}

	addChild(child, screen) {
		if (!child instanceof Child) {
			throw new Error('Children of nodes must be of type Child')
		}
		this._children.push(child)
		const node = child.newInstance(screen, this)
		if (this.currentInstance()) {
			this.currentInstance().append(node)
		}
	}

	addChildren(children, screen) {
		children.forEach((child) => this.addChild(child, screen))
	}

	removeAllChildren() {
		if (this.currentInstance()) {
			this.currentInstance().children.forEach((rawChild) => {
				this.currentInstance().remove(rawChild)
			})
		}

		this._children = []
	}

	currentInstance() {
		return this._blessedInstance
	}

	newInstance(screen, parent) {

		if (this._blessedInstance) {
			throw new Error('A blessed instance has already been created for this node')
		}

		const node = this.initializer(screen.currentState(), screen.setState, screen._actionHandler)
		this._blessedInstance = node
		this.addChildren(this._children, screen)
		screen.registerChild(this)
		// this.mapState(node, screen.currentState(), screen, this)
		return node
	}

	updateState(screen, node = this.currentInstance()) {
		this.mapState(node, screen.currentState(), screen, this)
		this._children.forEach((child) => child.updateState(screen, child.currentInstance()))
	}

}
