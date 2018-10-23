import Stack from "./Stack";
import {ifStackType, listFromItems, listFromFields} from "./StackGUIHelpers";

export class EditorDisplayManager {

	constructor() {
		this._rootStack
		this._head

		this._confirming = false

		this._session = 1

		this.triggerRedraw = this.triggerRedraw.bind(this)
		this.setupFor = this.setupFor.bind(this)
		this.sessionId = this.sessionId.bind(this)
		this.getHead = this.getHead.bind(this)
		this.setValueOnHead = this.setValueOnHead.bind(this)
		this.isRoot = this.isRoot.bind(this)
		this.updateHead = this.updateHead.bind(this)
		this.beginConfirm = this.beginConfirm.bind(this)
		this.closeConfirm = this.closeConfirm.bind(this)
		this.confirm = this.confirm.bind(this)
		this.confirmState = this.confirmState.bind(this)
		this.matchesSchema = this.matchesSchema.bind(this)
		this.resetHead = this.resetHead.bind(this)

		this._finishCallbacks = []
	}

	setupFor(initialValue, schema) {
		this._session ++ // for redrawing purposes
		const stack = Stack.forObject(initialValue, schema)
		this._rootStack = stack
		this._confirming = false
		this._finishCallbacks = [] //clear callbacks
		this._head = stack
	}

	triggerRedraw() {
		this._session ++
	}

	sessionId() {
		return this._session
	}

	get nonEmpty() {
		return !!this._rootStack && !!this._head
	}

	/*
	Confirm State Management
	 */

	get confirming() {
		return this._confirming
	}

	beginConfirm() {
		this._confirming = true
	}

	closeConfirm() {
		this._confirming = false
	}

	confirm() {
		this._confirming = false
		this._finishCallbacks.forEach((i) => i({
			value: this._rootStack.currentValue(),
			validation: this._rootStack.matchesSchema()
		}))

		this._rootStack = null
		this._head = null
		this._finishCallbacks = []
	}

	onFinish(callback) {
		if (typeof callback === 'function') {
			this._finishCallbacks.push(callback)
		}
	}

	confirmState() {
		const schemaMatchResults = this.matchesSchema()
		return {
			isValid: schemaMatchResults.isMatch,
			errors: schemaMatchResults.errors,
			actionSummary: 'Something will happen...',
			value: this._rootStack.currentValue()
		}
	}


	/*
	Head management
	 */

	isRoot() {
		return (this._rootStack === this._head) && !!this._rootStack
	}

	getHead() {
		return this._head
	}

	setValueOnHead(fieldName, value) {
		this.getHead().set(fieldName, value)
		this._session++ //iterate session to trigger a redraw

	}

	updateHead(newHead) {
		newHead.refreshSelf()
		this._head = newHead
		this._session++
	}

	resetHead() {
		this._head = this._rootStack
		this._session++
	}

	matchesSchema() {
		return this._rootStack.matchesSchema()
	}

	/*
	Display state management
	 */

	displayState() {
		if (this.nonEmpty) {
			const head = this._head

			return ifStackType(head, {
				object: (objStack) => {
					const fields = objStack.fieldsForObject()

					return {
						fieldsStrings: listFromFields(fields),
						fields: fields,
						path: '',
						schema: head.getSchema()
					}

				},
				array: (arrStack) => {
					const items = arrStack.items()
					return {
						fieldsStrings: listFromItems(items),
						fields: items,
						path: '',
						schema: head.getSchema()
					}
				}
			})

		}
	}

}

export const editorDisplayManager = new EditorDisplayManager()
