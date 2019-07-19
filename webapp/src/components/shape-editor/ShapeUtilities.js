export const coreShapeIds = ['$string', '$number', '$boolean', '$object', '$list', '$map', '$oneOf', '$identifier', '$reference', '$any']
export const coreShapeIdsSet = new Set(coreShapeIds)

class ShapeUtilities {
    static flatten(queries, rootShapeId, depth, trail = [], acc = []) {
        // if baseShapeId is a coreShapeId, stop traversing
        // if baseShapeId is an inline shape (empty name), continue traversing
        const shape = queries.shapeById(rootShapeId)
        const {name, baseShapeId, bindings, fields, parameters} = shape;
        if (coreShapeIdsSet.has(rootShapeId)) {
            return;
        }
        const baseShape = queries.shapeById(baseShapeId)
        if (name !== '') {
            acc.push({
                id: shape.shapeId,
                type: 'shape',
                name: name,
                shapeName: ShapeUtilities.shapeName(queries, baseShape, shape, bindings),
                parameters: parameters,
                actions: [],
                trail: [...trail, rootShapeId],
                depth
            })
        }

        const shouldTraverseFields = ShapeUtilities.shouldTraverseFields(shape)
        if (shouldTraverseFields) {
            fields.forEach(field => {
                if (field.isRemoved) {
                    return
                }
                const fieldTrail = [...trail, rootShapeId, field.fieldId]
                acc.push({
                    id: field.fieldId,
                    type: 'field',
                    name: field.name,
                    shapeName: ShapeUtilities.fieldShapeName(queries, shape, field),
                    parameters: [],
                    actions: [],
                    trail: fieldTrail,
                    depth: depth + 1
                })
                const [isInlineObject, fieldShape] = ShapeUtilities.isInlineObject(queries, field)
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
        const {fieldShapeDescriptor, name} = field

        if (fieldShapeDescriptor.FieldShapeFromShape) {
            const shape = queries.shapeById(fieldShapeDescriptor.FieldShapeFromShape.shapeId)
            const name = shape.name
            if (!name && shape.baseShapeId === '$object') {
                return [true, shape]
            }
            return [false]
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
                bindingInfo: []
            }
        }
    }

    static shapeName(queries, baseShape, bindingContextShape, bindings) {
        if (baseShape.parameters.length === 0) {
            return {
                id: baseShape.shapeId,
                baseShapeName: baseShape.name || queries.shapeById(baseShape.baseShapeId).name,
                bindingInfo: []
            }
        }
        const bindingNames = baseShape.parameters
            .map(parameter => {
                const binding = bindings[parameter.shapeParameterId]
                if (binding) {
                    if (binding.ShapeProvider) {
                        return {
                            binding,
                            boundName: queries.shapeById(binding.ShapeProvider.shapeId).name,
                            parameterName: parameter.name,
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
                            boundName: provider.name,
                            parameterName: parameter.name
                        }
                    }
                }
                return {
                    parameterName: parameter.name
                }
            })
        return {
            id: baseShape.shapeId,
            baseShapeName: baseShape.name || queries.shapeById(baseShape.baseShapeId).name,
            bindingInfo: bindingNames
        }
    }
}

export {
    ShapeUtilities
}