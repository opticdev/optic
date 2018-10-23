export const simpleSchema = {
	type: 'object',
	properties: {
		first: {type: 'string'},
		second: {type: 'string'},
		third: {type: 'string'},
	},
	_order: ['second', 'first', 'third']
}


export const routeSchema = {
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
