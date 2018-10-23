import assert from 'assert'
import {EditorDisplayManager} from "../EditorDisplayManager";
import {routeSchema} from "./ExampleSchemas";

describe('editor display', () => {

	const displayManagerFixture = () => new EditorDisplayManager()

	it('can be loaded with a root stack', () => {
		const displayManager = displayManagerFixture()
		displayManager.setupFor({}, routeSchema)
	})

	it('creates a proper display object for head when root', () => {
		const displayManager = displayManagerFixture()
		displayManager.setupFor({method: 'get'}, routeSchema)
		assert.deepEqual(displayManager.displayState(), {
				"fieldsStrings": [ 'url: ___________',
					'method: "get"',
					'parameters: ___________',
					'headers: ___________',
					'responses: ___________' ],
				"fields": [{
					"schema": {
						"type": "string"
					},
					"name": "url",
					"initialValue": undefined,
					"value": undefined,
					"order": 0
				}, {
					"schema": {
						"type": "string",
						"enum": ["get", "post", "put", "delete", "head", "options"]
					},
					"name": "method",
					"initialValue": 'get',
					"value": 'get',
					"order": 1
				}, {
					"schema": {
						"type": "array",
						"items": {
							"title": "Parameter",
							"type": "object",
							"required": ["in", "name"],
							"properties": {
								"in": {
									"type": "string",
									"enum": ["query", "body", "params", "header"]
								},
								"name": {
									"type": "string"
								}
							}
						}
					},
					"name": "parameters",
					"initialValue": undefined,
					"value": undefined,
					"order": 2
				}, {
					"schema": {
						"type": "array",
						"items": {
							"title": "Header",
							"type": "object",
							"required": ["name"],
							"properties": {
								"name": {
									"type": "string"
								}
							}
						}
					},
					"initialValue": undefined,
					"value": undefined,
					"name": "headers",
					"order": 3
				}, {
					"schema": {
						"type": "array",
						"items": {
							"title": "Response",
							"type": "object",
							"required": ["code"],
							"properties": {
								"code": {
									"type": "number"
								}
							}
						}
					},
					"initialValue": undefined,
					"value": undefined,
					"name": "responses",
					"order": 4
				}],
				"path": "",
				"schema": {
					"title": "Route",
					"type": "object",
					"required": ["method", "url"],
					"properties": {
						"method": {
							"type": "string",
							"enum": ["get", "post", "put", "delete", "head", "options"]
						},
						"url": {
							"type": "string"
						},
						"headers": {
							"type": "array",
							"items": {
								"title": "Header",
								"type": "object",
								"required": ["name"],
								"properties": {
									"name": {
										"type": "string"
									}
								}
							}
						},
						"parameters": {
							"type": "array",
							"items": {
								"title": "Parameter",
								"type": "object",
								"required": ["in", "name"],
								"properties": {
									"in": {
										"type": "string",
										"enum": ["query", "body", "params", "header"]
									},
									"name": {
										"type": "string"
									}
								}
							}
						},
						"responses": {
							"type": "array",
							"items": {
								"title": "Response",
								"type": "object",
								"required": ["code"],
								"properties": {
									"code": {
										"type": "number"
									}
								}
							}
						}
					},
					"_order": ["url", "method", "parameters", "headers", "responses"]
				}
			})
	})

	it('can update head to property', () => {
		const displayManager = displayManagerFixture()
		displayManager.setupFor({method: 'get'}, routeSchema)

		const headStack = displayManager.getHead()

		const newStack = headStack.stackForProperty('parameters', displayManager)

		assert.deepEqual(displayManager._head, newStack)
	})

	it('can make changes, then pop back to root', () => {
		const displayManager = displayManagerFixture()
		displayManager.setupFor({method: 'get'}, routeSchema)
		const headStack = displayManager.getHead()
		const arrayStack = headStack.stackForProperty('parameters', displayManager)
		arrayStack.addItem({in: 'body', name: 'aidan'})

		//additions
		assert(arrayStack.items().length === 1)
		assert(arrayStack.matchesSchema().isMatch)

		//does not affect parent stack's value
		assert.deepEqual(displayManager._rootStack._value, {method: 'get'})

		arrayStack.pop(displayManager)

		assert.deepEqual(displayManager.getHead().currentValue(),
			{ method: 'get', parameters: [ { in: 'body', name: 'aidan' } ] })
	})

})


