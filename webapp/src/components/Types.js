export const primitiveColors = {
	string: '#29447b',
	number: '#e4508f',
	integer: '#2d9167',
	boolean: '#ff502f',
	object: '#32417d',
	list: '#7d1e34',
	map: '#7d521f',
}

export const typeOptionNames = {
	string: 'String',
	number: 'Number',
	integer: 'Int',
	boolean: 'Bool',
	object: 'Object',
	list: 'List[T]',
	map: 'Map[String, T]',
}

export function generateTypeName(type, node, otherTypes = []) {

	const EitherType = (typeParameters) => {

		if (typeParameters.length > 1) {
			const types = typeParameters
				.map(i => generateTypeName(i.shape.type, i.shape, otherTypes))
				.filter(onlyUnique)
				.join(', ')
			return `${types}`
		}

		if (typeParameters.length === 1) {
			return ` ${generateTypeName(typeParameters[0].shape.type, typeParameters[0].shape, otherTypes)} `
		}

		return ` Any `
	}

	const types = {
		string: () => 'String',
		number: () => 'Number',
		integer: () => 'Int',
		boolean: () => 'Bool',
		object: () => `Object (${node.fields.length} field${node.fields.length === 1 ? '' : 's'})`,
		list: () => {
			return `List[ ${EitherType(node.typeParameters)} ]`
		},
		map: () => `Map[String, Any]`
	}

	if (type.isRef) {
		const t = otherTypes.find(i => i.id === type.id)
		return t.name
	}

	const template = types[type.id] || (() => type.id)
	return template()
}


function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
