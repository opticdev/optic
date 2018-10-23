import deepFreeze from 'deep-freeze'
import equals from 'equals'
import isArray from 'lodash.isarray'
import Ajv from 'ajv'
const ajv = Ajv()
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

export const string = {type: 'string', title: 'String'}
export const number = {type: 'number', title: 'Number'}
// export const boolean = {type: 'boolean', title: 'Boolean'}
export const object = {type: 'object', title: 'Object'}
export const array = {type: 'array', title: 'Array'}

export const RawCode = deepFreeze({
	"type": "object",
	"required": ["_valueFormat", "value"],
	"properties": {
		"_valueFormat": {"type": "string", "const": "code"},
		"value": {"type": "string"}
	},
	"title": "Code",
	"default": {
		"value": "code",
		"_valueFormat": "code"
	}
})
export const Token = deepFreeze({
	"type": "object",
	"required": ["_valueFormat", "value"],
	"properties": {
		"_valueFormat": {"type": "string", "const": "token"},
		"value": {"type": "string"}
	},
	"title": "Token",
	"default": {
		"value": "token",
		"_valueFormat": "token"
	}
})

export const DefaultTypeSelection = [string, number, object, array, RawCode, Token]


export function typesForSchema(schema) {

	const hasType = !!schema.type
	const hasAnyOf = !!schema.anyOf

	if (hasType) {
		if (isArray(schema.type)) {
			return schema.type
		} else {
			return [schema.type]
		}
	}

	if (hasAnyOf) {
		return schema.anyOf
	}


	return DefaultTypeSelection

}

export function impliedTypesForSchema(data, schema) {

	const possibleTypes = typesForSchema(schema)

	if (typeof data === 'undefined') {
		return [possibleTypes[0]]
	}

	const results = possibleTypes.reduce((accumulator, candidate) => {

		try {
			let schemaRaw;

			if (typeof candidate === 'string') {
				schemaRaw = {type: candidate}
			} else {
				schemaRaw = candidate
			}

			const validate = ajv.compile(schemaRaw);

			if (validate(data)) {
				accumulator.push(schemaRaw)
			}

		} catch (e) {

		}

		return accumulator

	}, [])

	//strip out the basic object match if there are value format options
	if (results.some(i=> i.hasOwnProperty('required') && i.required.includes('_valueFormat'))){
		return results.filter(i=> !equals(i, object))
	}

	return results
}
