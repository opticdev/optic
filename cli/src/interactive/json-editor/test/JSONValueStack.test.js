import assert from 'assert'
import Stack from '../Stack'
import {routeSchema, simpleSchema} from "./ExampleSchemas";

describe('json value stack', () => {

	it('can be initialized', () => {
		Stack.forValue({}, {type: 'object'})
	})

	it('can be set', () => {
		const valueStack = Stack.forValue({}, {type: 'object'})
		valueStack.set('hello.me', true)
		assert.deepEqual(valueStack.currentValue(), {hello: {me: true}})
	})

	it('value can be retrieved', () => {
		const valueStack = Stack.forValue({}, {type: 'object'})
		valueStack.set('hello.me', true)
		assert(valueStack.get('hello.me') === true)
	})

	it('current value can be validated', () => {
		const valueStack = Stack.forValue({}, {type: 'object', required: ['hello', 'hello2']})
		valueStack.set('hello', true)
		valueStack.set('hello2', 'string')
		assert(valueStack.matchesSchema().isMatch)
	})

	it('current value validation errors can be collected', () => {
		const valueStack = Stack.forValue({}, {type: 'object', required: ['hello', 'hello2']})
		assert(!valueStack.matchesSchema().isMatch)
		assert(valueStack.matchesSchema().errors.length === 2)
	})

	it('current value is always a copy', () => {
		const valueStack = Stack.forValue({}, {type: 'object'})
		valueStack.set('hello.me', true)
		valueStack.currentValue().hello = [] //adversarial assignment
		assert(valueStack.get('hello.me') === true)
	})


	describe('object', () => {
		it('works when valid object passed', () => {
			Stack.forObject({}, {type: 'object'})
		})

		it('throws when non-object passed', () => {
			assert.throws(() => {
				Stack.forObject('string ... not good', {type: 'object'})
			})

			assert.throws(() => {
				Stack.forObject({}, {type: 'array'})
			})
		})

		it('can extract fields from schema', () => {

			const objStack = Stack.forObject({}, simpleSchema)

			assert.deepStrictEqual(objStack.fieldsForObject(), [
				{schema: {type: 'string'}, name: 'second', order: 0},
				{schema: {type: 'string'}, name: 'first', order: 1},
				{schema: {type: 'string'}, name: 'third', order: 2}])
		})

	})

	describe('array ', () => {
		it('works when valid array passed', () => {
			Stack.forArray([], {type: 'array'})
		})

		it('throws when non-array passed', () => {
			assert.throws(() => {
				Stack.forArray('string ... not good', {type: 'array'})
			})

			assert.throws(() => {
				Stack.forObject([], {type: 'string'})
			})
		})

		it('can show all items', () => {
			const parametersStack = Stack.forArray([
				{in: 'body', name: 'test'},
				{in: 'query', name: 'test2'}], routeSchema.properties.parameters)

			assert.deepEqual(parametersStack.items(), [{
					"value": {"in": "body", "name": "test"},
					"order": 0,
					"schema": {
						"title": "Parameter",
						"type": "object",
						"required": ["in", "name"],
						"properties": {
							"in": {"type": "string", "enum": ["query", "body", "params", "header"]},
							"name": {"type": "string"}
						}
					},
					"impliedType": [{"type": "object"}]
				}, {
					"value": {"in": "query", "name": "test2"},
					"order": 1,
					"schema": {
						"title": "Parameter",
						"type": "object",
						"required": ["in", "name"],
						"properties": {
							"in": {"type": "string", "enum": ["query", "body", "params", "header"]},
							"name": {"type": "string"}
						}
					},
					"impliedType": [{"type": "object"}]
				}]
			);

		})

		it('can add items', () => {
			const arrayStack = Stack.forArray([], {type: 'array'})
			arrayStack.addItem({name: 'aidan'})
			assert.deepStrictEqual(arrayStack.currentValue(), [{name: 'aidan'}])
		})

		it('can add at another index', () => {
			const arrayStack = Stack.forArray([], {type: 'array'})
			arrayStack.addItem('a')
			arrayStack.addItem('b')
			arrayStack.addItem('c')

			arrayStack.addItem('ab', 1)

			assert.deepStrictEqual(arrayStack.currentValue(), ['a', 'ab', 'b', 'c'])
		})

		it('can remove items', () => {
			const arrayStack = Stack.forArray([], {type: 'array'})
			arrayStack.addItem({name: 'aidan'})
			arrayStack.addItem({name: 'david'})
			arrayStack.removeItem(1)
			assert.deepStrictEqual(arrayStack.currentValue(), [{name: 'aidan'}])
		})

		it('can update items at index', () => {
			const arrayStack = Stack.forArray([], {type: 'array'})
			arrayStack.addItem({name: 'aidan'})
			arrayStack.addItem({name: 'david'})
			arrayStack.updateIndex(1, {name: 'divad'})
			assert.deepStrictEqual(arrayStack.currentValue(), [{name: 'aidan'}, {name: 'divad'}])
		})

		describe('moving items', () => {
			it('inner item down', () => {
				const arrayStack = Stack.forArray([], {type: 'array'})
				arrayStack.addItem({name: 'a'})
				arrayStack.addItem({name: 'b'})
				arrayStack.addItem({name: 'c'})

				arrayStack.moveItem(0, true)
				assert.deepStrictEqual(arrayStack.currentValue(), [ { name: 'b' }, { name: 'a' }, { name: 'c' } ])

			})

			it('inner item up', () => {
				const arrayStack = Stack.forArray([], {type: 'array'})
				arrayStack.addItem({name: 'a'})
				arrayStack.addItem({name: 'b'})
				arrayStack.addItem({name: 'c'})

				arrayStack.moveItem(1, false)
				assert.deepStrictEqual(arrayStack.currentValue(), [ { name: 'b' }, { name: 'a' }, { name: 'c' } ])

			})

			it('outer item down', () => {
				const arrayStack = Stack.forArray([], {type: 'array'})
				arrayStack.addItem({name: 'a'})
				arrayStack.addItem({name: 'b'})
				arrayStack.addItem({name: 'c'})

				arrayStack.moveItem(2, true)
				assert.deepStrictEqual(arrayStack.currentValue(), [ { name: 'a' }, { name: 'b' }, { name: 'c' } ])

			})

			it('outer item up', () => {
				const arrayStack = Stack.forArray([], {type: 'array'})
				arrayStack.addItem({name: 'a'})
				arrayStack.addItem({name: 'b'})
				arrayStack.addItem({name: 'c'})
				arrayStack.moveItem(0, false)
				assert.deepStrictEqual(arrayStack.currentValue(), [ { name: 'a' }, { name: 'b' }, { name: 'c' } ])

			})
		})


	})


})
