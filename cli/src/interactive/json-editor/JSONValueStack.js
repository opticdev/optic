import deepcopy from "deepcopy";
import objectPath from 'object-path'
import Ajv from 'ajv'
import Stack from "./Stack";
import assert from 'assert'
const ajv = Ajv({allErrors: true})
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

export class JSONValueStack {
	constructor(initialValue, schema, {parentStack, absolutePath} = {absolutePath: ''}) {
		this._value = deepcopy(initialValue)
		this._schema = deepcopy(schema)
		this._parentStack = parentStack
		this._absolutePath = absolutePath
		this._initialValue = initialValue

		this.type = 'any'

		this.refreshSelf = this.refreshSelf.bind(this)
		this.pushChangesUpStack = this.pushChangesUpStack.bind(this)
		this.matchesSchema = this.matchesSchema.bind(this)
		this.currentValue = this.currentValue.bind(this)
		this.getSchema = this.getSchema.bind(this)
		this.canPop = this.canPop.bind(this)
		this.pop = this.pop.bind(this)
		this.set = this.set.bind(this)
		this.get = this.get.bind(this)
		this.getAbsolutePath = this.getAbsolutePath.bind(this)
		this.stackForProperty = this.stackForProperty.bind(this)
	}

	set(path, value) {
		objectPath.set(this._value, path, value);
	}

	get(path) {
		return objectPath.get(this._value, path);
	}

	currentValue() {
		return deepcopy(this._value)
	}

	getSchema() {
		return this._schema
	}

	refreshSelf() {
		if (this._parentStack) {
			const newValue = this._parentStack.get(this.getAbsolutePath())
			if (newValue) {
				this._value = deepcopy(newValue)
			}
		}
	}

	matchesSchema() {
		const validate = ajv.compile(this._schema);
		if (validate(this._value)) {
			return {isMatch: true, errors: validate.errors || []}
		} else {
			return {isMatch: false, errors: validate.errors || []}
		}
	}

	canPop() {
		return !!this._parentStack
	}

	pop(displayManager) {
		if (!this._parentStack) {
			assert('Must have a parent to pop this stack')
		} else {
			this.pushChangesUpStack(displayManager)
			displayManager.updateHead(this._parentStack)
		}

	}

	pushChangesUpStack(displayManager) {
		if (!this._parentStack) {
			assert('Must have a parent to push changes up this stack')
		} else {
			const absolutePath = this.getAbsolutePath()
			//update value relative to root
			displayManager._rootStack.set(absolutePath, this.currentValue())
		}
	}

	getAbsolutePath() {
		return this._absolutePath
	}


	stackForProperty(key, displayManager) {

		const {schema, initialValue} = (() => {
			if (this.type === 'object') {
				const schema = this.fieldSchema(key)
				const initialValue = this.get(key)
				return {schema, initialValue}
			} else if (this.type === 'array') {
				const schema = this.itemsSchema()
				const initialValue = this.get(key)
				return {schema, initialValue}
			}
		})()

		const newStack = (() => {
			if (!!schema) {
				const absolutePath = (this._absolutePath + '.' + key).replace(/^\./, '')
				switch (schema.type) {
					case 'object':
						return Stack.forObject(initialValue, schema, {parentStack: this, absolutePath: absolutePath})
					case 'array':
						return Stack.forArray(initialValue, schema, {parentStack: this, absolutePath: absolutePath})
					default:
						return Stack.forValue(initialValue, schema, {parentStack: this, absolutePath: absolutePath})
						break;

				}
			}
		})()


		if (newStack) {
			if (displayManager) {
				displayManager.updateHead(newStack)
			}
			return newStack
		}

	}

}
