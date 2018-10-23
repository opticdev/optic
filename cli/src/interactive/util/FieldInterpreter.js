export function readPrimitiveValue(stringValue, ofType) {
	if (ofType === 'string') {
		return stringValue
	}

	if (ofType === 'boolean') {
		return  (stringValue == 'true')
	}

	if (ofType === 'number') {
		return parseInt(stringValue)
	}
}


export function isPrimitiveField(fieldSchema) {
	return ['string', 'boolean', 'number'].includes(fieldSchema.type)
}

export function isArrayField(fieldSchema) {
	return 'array' === fieldSchema.type
}

export function isObjectField(fieldSchema) {
	return 'object' === fieldSchema.type
}

