import {ShapesHelper} from '../../engine';

export function unwrap(obj) {

	const keys = Object.keys(obj)

	if (keys.length > 1 && obj.shape) {
		return {...obj, shape: unwrap(obj.shape)}
	}

	if (keys.length !== 1) {
		throw new Error('unexpected shape format.')
	}


	const shapeType = keys[0]
	const value = obj[keys[0]]

	const {isField, isTypeParameter, isObjectFieldList, isTypeParametersList, isLeaf} = value

	const decodedType = ShapesHelper.decodeType(value.type)

	return {
		isField, isTypeParameter, isObjectFieldList, isTypeParametersList, isLeaf,
		rawType: shapeType,
		...value,
		type: decodedType,
		isUnwrapped: true,
	}

}
