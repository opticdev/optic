export function fieldPredicates(fieldSchema) {
	return {
		isString: () => fieldSchema.type === 'string',
		hasEnum: () => Array.isArray(fieldSchema.enum),

		isArray: () => fieldSchema.type === 'array'
	}
}

export function emptyAsk(combinedAsk) {
	const properties = combinedAsk.properties || {}
	return !Object.entries(properties).length
}
