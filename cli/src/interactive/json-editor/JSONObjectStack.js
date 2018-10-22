import {JSONValueStack} from "./JSONValueStack";
import assert from 'assert'
import isObject from 'lodash.isobject'
import sortBy from 'lodash.sortby'
import deepcopy from 'deepcopy'

export class JSONObjectStack extends JSONValueStack {
	constructor(initialValue = {}, schema, parentInfo = {absolutePath: ''}) {
		assert(isObject(initialValue), 'Initial value must be an object')
		assert(schema.type === 'object', 'Schema must be of type "object"')
		super(initialValue, schema, parentInfo)
		this.type = 'object'
		this.fieldsForObject = this.fieldsForObject.bind(this)
		this.fieldSchema = this.fieldSchema.bind(this)
	}

	fieldsForObject() {
		const schema = this._schema
		const properties = schema.properties || {}
		const order = schema._order || schema.order || []

		const initialValue = deepcopy(this._initialValue)
		const value = deepcopy(this._value)

		const entries = Object.entries(properties || {}).filter(key => {
			const k = key[0][0]
			return k !== '^' && k !== '_'
		})

		const mapped = entries.map(i => {
			const key = i[0]
			return {
				schema: i[1],
				name: key,
				order: (order && order.includes(key) ? order.indexOf(key) : undefined),
				initialValue: initialValue[key],
				value: value[key]
			}
		})

		const sorted = sortBy(
			mapped, ['order', 'name']);

		return sorted

	}

	fieldSchema(key) {
		const found = (this._schema.properties || {})[key]
		if (found) {
			return deepcopy(found)
		}
	}
}
