import {JSONValueStack} from "./JSONValueStack";
import assert from 'assert'
import deepcopy from 'deepcopy'
import {impliedTypesForSchema, typesForSchema} from "../util/SchemaHelpers";

export class JSONArrayStack extends JSONValueStack {

	constructor(initialValue = [], schema, parentInfo = {absolutePath: ''}) {
		assert(Array.isArray(initialValue), 'Initial value must be an array')
		assert(schema.type === 'array', 'Schema must be of type "array"')
		super(initialValue, schema, parentInfo)

		this.type = 'array'
		this.itemsSchema = this.itemsSchema.bind(this)
		this.validNewPlaceholderValue = this.validNewPlaceholderValue.bind(this)
		this.moveItem = this.moveItem.bind(this)
		this.addItem = this.addItem.bind(this)
		this.removeItem = this.removeItem.bind(this)
		this.updateIndex = this.updateIndex.bind(this)
		this.moveItem = this.moveItem.bind(this)
		this.empty = this.empty.bind(this)
		this.items = this.items.bind(this)
		this.validNewPlaceholderValue = this.validNewPlaceholderValue.bind(this)
	}

	itemsSchema() {
		return this._schema.items || {}
	}

	addItem(item, atIndex) {
		if (item) {
			if (typeof atIndex === 'number') {
				this._value.splice(atIndex, 0, item)
			} else {
				this._value.push(item)
			}
		}
	}

	removeItem(index) {
		this._value.splice(index, 1)
	}

	updateIndex(index, item) {
		this._value.splice(index, 1, item)
	}

	moveItem(index, down) {

		//skip if at the top or bottom
		if (index === 0 && !down ||
			index === this.currentValue().length -1 && down) {
			return
		}

		const move = (from, to) => {
			this._value.splice(to, 0, this._value.splice(from, 1)[0]);
		}

		move(index, (down) ? index + 1 : index - 1)
	}

	empty() {
		this._value = []
	}

	items() {
		const itemsSchema = this.itemsSchema()
		return deepcopy(this._value).map((item, index) => {
			const impliedType = impliedTypesForSchema(item, itemsSchema)
			return {value: item, order: index, impliedType: impliedType, schema: itemsSchema}
		})
	}

	validNewPlaceholderValue() {
		const types = typesForSchema(this.itemsSchema())
		if (types.length) {
			switch (types[0]) {
				case 'object':
					return {}
				case 'array':
					return {}
				case 'string':
					return '';
				case 'boolean':
					return true
				case 'number':
					return 0
			}
		} else {
			return {}
		}
	}

}
