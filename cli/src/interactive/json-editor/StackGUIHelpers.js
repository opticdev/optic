import {JSONArrayStack} from "./JSONArrayStack";
import {JSONObjectStack} from "./JSONObjectStack";
import {isArrayField, isObjectField, isPrimitiveField} from "../util/FieldInterpreter";

export function listFromFields(fields) {
	return fields.map((field) => {
		if (isPrimitiveField(field.schema)) {
			return `${field.name}: ${(typeof field.value !== 'undefined') ? JSON.stringify(field.value) : '_'}`
		} else if (isArrayField(field.schema)) {
			return `${field.name}: ${(typeof field.value !== 'undefined' && field.value.length) ? `[${field.value.length} items]` : '[]'}`
		} else if (isObjectField(field.schema)) {
			const numberOfEntries = Object.entries(field.value || {})
			return `${field.name}: ${(typeof field.value !== 'undefined' && numberOfEntries) ? `{${numberOfEntries.length} entries}` : '{}'}`
		} else {
			return `${field.name}: ${(typeof field.value !== 'undefined') ? JSON.stringify(field.value) : '_'}`
		}
	})
}

export function listFromItems(items) {
	return items.map((field, index) => {
		return `${index+1}. ${JSON.stringify(field.value)}`
	})
}

export function ifStackType(i, {array, object}) {
	if (i instanceof JSONArrayStack) {
		if (array) {
			return array(i)
		}
	} else if (i instanceof JSONObjectStack) {
		if (object) {
			return object(i)
		}
	}
}
