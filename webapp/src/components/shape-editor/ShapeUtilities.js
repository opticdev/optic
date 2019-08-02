import {boundParameterColor, primitiveColors} from './Types.js';

export const coreShapeIds = ['$string', '$number', '$boolean', '$object', '$list', '$map', /*'$oneOf',*/ '$identifier', '$reference', '$any']
export const coreShapeIdsSet = new Set(coreShapeIds)

class ShapeUtilities {
    static flatten(queries, rootShapeId, depth, trail = [], acc = []) {
        const shape = queries.shapeById(rootShapeId)
        const {name, baseShapeId, bindings, fields} = shape;
        if (coreShapeIdsSet.has(rootShapeId)) {
            return;
        }
        const baseShape = queries.shapeById(baseShapeId)
        const shouldTraverseFields = ShapeUtilities.shouldTraverseFields(shape)
        if (trail.length === 0 || name !== '') {
            acc.push({
                id: shape.shapeId,
                type: 'shape',
                name: name,
                shapeName: ShapeUtilities.shapeName(queries, baseShape, shape, bindings),
                isExpandable: shouldTraverseFields,
                trail: [...trail, rootShapeId],
                depth
            })
        }

        if (shouldTraverseFields) {
            fields.forEach(field => {
                if (field.isRemoved) {
                    return
                }
                const fieldTrail = [...trail, rootShapeId, field.fieldId]
                const [isInlineObject, fieldShape] = ShapeUtilities.isInlineObject(queries, field)
                acc.push({
                    id: field.fieldId,
                    parentShapeId: rootShapeId,
                    fieldShapeId: fieldShape ? fieldShape.shapeId : null,
                    type: 'field',
                    name: field.name,
                    shapeName: ShapeUtilities.fieldShapeName(queries, shape, field),
                    trail: fieldTrail,
                    isExpandable: isInlineObject,
                    depth: depth + 1
                })
                if (isInlineObject) {
                    ShapeUtilities.flatten(queries, fieldShape.shapeId, depth + 1, fieldTrail, acc)
                }
            })

        }
    }

    static shouldTraverseFields(shape) {
        return shape.baseShapeId === '$object'
    }

    static isInlineObject(queries, field) {
        const {fieldShapeDescriptor} = field

        if (fieldShapeDescriptor.FieldShapeFromShape) {
            const shape = queries.shapeById(fieldShapeDescriptor.FieldShapeFromShape.shapeId)
            const name = shape.name
            if (shape.baseShapeId === '$object' && name === '') {
                return [true, shape]
            }
            return [false, shape]
        } else if (fieldShapeDescriptor.FieldShapeFromParameter) {
            return [false]
        }

    }

    static fieldShapeName(queries, shape, field) {
        const {fieldShapeDescriptor} = field;
        if (fieldShapeDescriptor.FieldShapeFromShape) {
            const fieldShapeId = fieldShapeDescriptor.FieldShapeFromShape.shapeId
            const fieldShape = queries.shapeById(fieldShapeId)
            return ShapeUtilities.shapeName(queries, fieldShape, shape, field.bindings)
        } else if (fieldShapeDescriptor.FieldShapeFromParameter) {
            const parameterId = fieldShapeDescriptor.FieldShapeFromParameter.shapeParameterId
            const parameter = shape.parameters.find(x => x.shapeParameterId === parameterId)
            if (!parameter) {
                console.warn(`expected parameter ${parameterId} to be in parent shape ${shape.shapeId} for field ${field.fieldId}`)
            }
            return {
                parameterName: parameter.name,
                parameterId: parameter.shapeParameterId,
                bindingInfo: [],
            }
        }
    }

    static shapeName(queries, baseShape, bindingContextShape, bindings) {
        const base = {
            id: baseShape.shapeId,
            color: primitiveColors[baseShape.baseShapeId],
            baseShapeName: baseShape.name || queries.shapeById(baseShape.baseShapeId).name,
        }
        if (baseShape.parameters.length === 0) {
            return {
                ...base,
                bindingInfo: []
            }
        }
        const bindingNames = baseShape.parameters
            .map(parameter => {
                const binding = bindings[parameter.shapeParameterId]
                if (binding) {
                    if (binding.ShapeProvider) {
                        const {shapeId} = binding.ShapeProvider;
                        const shape = queries.shapeById(shapeId)
                        return {
                            binding,
                            color: primitiveColors[shape.baseShapeId],
                            boundName: queries.shapeById(shapeId).name || '(unnamed)',
                            parameterName: parameter.name,
                            parameterId: parameter.shapeParameterId,
                        }
                    }

                    if (binding.ParameterProvider) {
                        const parameterId = binding.ParameterProvider.shapeParameterId
                        const provider = bindingContextShape.parameters.find(x => x.shapeParameterId === parameterId)
                        if (!provider) {
                            console.warn(`expected parameter ${parameterId} to be in parent shape ${bindingContextShape.shapeId}`)
                        }
                        return {
                            binding,
                            color: boundParameterColor,
                            boundName: provider ? provider.name || '(unnamed)' : null,
                            parameterName: parameter.name,
                            parameterId: parameter.shapeParameterId,
                        }
                    }
                }
                return {
                    parameterName: parameter.name,
                    parameterId: parameter.shapeParameterId,
                }
            })
        return {
            ...base,
            bindingInfo: bindingNames
        }
    }
}

export {
    ShapeUtilities
}