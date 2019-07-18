import {ShapesCommands} from '../../engine';
import {coreShapeIds} from './ShapeUtilities.js';

export function listChoicesForShape(cachedQueryResults, shapeId, blacklist) {
    const {conceptsById, shapesState} = cachedQueryResults
    const coreShapeChoices = coreShapeIds.map(coreShapeId => {
        return {
            displayName: shapesState.shapes[coreShapeId].descriptor.name,
            value: coreShapeId,
            id: coreShapeId,
            valueForSetting: coreShapeId,
        }
    })
    const blacklistedShapeIds = new Set(blacklist);
    const conceptChoices = Object.entries(conceptsById)
        .filter(([conceptShapeId, shape]) => {
            const isBlacklisted = blacklistedShapeIds.has(conceptShapeId)
            return !isBlacklisted
        })
        .map(([conceptShapeId, shape]) => {
            return {
                displayName: shape.name,
                value: conceptShapeId,
                id: conceptShapeId,
                valueForSetting: conceptShapeId,
            }
        })
    return [
        ...coreShapeChoices,
        ...conceptChoices,
    ]
}

export function listChoicesForParameter(cachedQueryResults, parametersAvailableForUse) {
    const {shapesState, conceptsById} = cachedQueryResults
    const coreShapeChoices = coreShapeIds.map(coreShapeId => {
        return {
            displayName: shapesState.shapes[coreShapeId].descriptor.name,
            id: coreShapeId,
            value: {ShapeProvider: {shapeId: coreShapeId}},
            valueForSetting: ShapesCommands.ShapeProvider(coreShapeId)
        }
    })
    const parameterChoices = parametersAvailableForUse.map(availableParameter => {
        const parameter = shapesState.shapeParameters[availableParameter.shapeParameterId]
        const shape = shapesState.shapes[parameter.descriptor.shapeId]
        return {
            displayName: `${shape.descriptor.name}.${availableParameter.name}`,
            id: availableParameter.shapeParameterId,
            value: {ParameterProvider: {shapeParameterId: availableParameter.shapeParameterId}},
            valueForSetting: ShapesCommands.ParameterProvider(availableParameter.shapeParameterId)
        }
    })
    const conceptChoices = Object.entries(conceptsById)
        .map(([conceptShapeId, shape]) => {
            return {
                displayName: shape.name,
                id: conceptShapeId,
                value: {ShapeProvider: {shapeId: conceptShapeId}},
                valueForSetting: ShapesCommands.ShapeProvider(conceptShapeId)
            }
        })
    return [
        ...coreShapeChoices,
        ...parameterChoices,
        ...conceptChoices
    ]
}

export function listChoicesForField(cachedQueryResults, fieldId, parametersAvailableForUse) {
    const {shapesState, conceptsById} = cachedQueryResults
    const coreShapeChoices = coreShapeIds.map(coreShapeId => {
        return {
            displayName: shapesState.shapes[coreShapeId].descriptor.name,
            id: coreShapeId,
            value: {FieldShapeFromShape: {fieldId, shapeId: coreShapeId}},
            valueForSetting: ShapesCommands.FieldShapeFromShape(fieldId, coreShapeId)
        }
    })
    const parameterChoices = parametersAvailableForUse.map(availableParameter => {
        const parameter = shapesState.shapeParameters[availableParameter.shapeParameterId]
        const shape = shapesState.shapes[parameter.descriptor.shapeId]
        return {
            displayName: `${shape.descriptor.name}.${availableParameter.name}`,
            id: availableParameter.shapeParameterId,
            value: {FieldShapeFromParameter: {fieldId, shapeParameterId: availableParameter.shapeParameterId}},
            valueForSetting: ShapesCommands.FieldShapeFromParameter(fieldId, availableParameter.shapeParameterId)
        }
    })
    const conceptChoices = Object.entries(conceptsById)
        .map(([conceptShapeId, shape]) => {
            return {
                displayName: shape.name,
                id: conceptShapeId,
                value: {FieldShapeFromShape: {fieldId, shapeId: conceptShapeId}},
                valueForSetting: ShapesCommands.FieldShapeFromShape(fieldId, conceptShapeId)
            }
        })
    return [
        ...coreShapeChoices,
        ...parameterChoices,
        ...conceptChoices
    ]
}