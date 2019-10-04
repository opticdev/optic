import {ShapesCommands} from '../../engine';
import {coreShapeIds} from './ShapeUtilities.js';
import {boundParameterColor, nonPrimitiveColor, primitiveColors} from './Types.js';
import {ConceptChoice, GenericConceptChoice} from './ShapePicker';


function enhanceChoiceForShape(baseChoice) {
  return {
    ...baseChoice,
    color: primitiveColors[baseChoice.id] || nonPrimitiveColor,
    value: baseChoice.id,
    valueForSetting: baseChoice.id
  };
}

function enhanceShapeChoiceForParameter(baseChoice) {
  return {
    ...baseChoice,
    color: primitiveColors[baseChoice.id] || nonPrimitiveColor,
    value: {ShapeProvider: {shapeId: baseChoice.id}},
    valueForSetting: ShapesCommands.ShapeProvider(baseChoice.id),
  };
}

function enhanceParameterChoiceForParameter(baseChoice) {
  return {
    ...baseChoice,
    color: boundParameterColor,
    value: {ParameterProvider: {shapeParameterId: baseChoice.id}},
    valueForSetting: ShapesCommands.ParameterProvider(baseChoice.id),
  };
}

function enhanceShapeChoiceForField(fieldId) {
  if (!fieldId) {
    debugger
  }
  return function (baseChoice) {
    if (!baseChoice.id) {
      debugger
    }
    return {
      ...baseChoice,
      color: primitiveColors[baseChoice.id] || nonPrimitiveColor,
      value: {FieldShapeFromShape: {fieldId, shapeId: baseChoice.id}},
      valueForSetting: ShapesCommands.FieldShapeFromShape(fieldId, baseChoice.id)
    };
  };
}

function enhanceParameterChoiceForField(fieldId) {
  return function (baseChoice) {
    return {
      ...baseChoice,
      color: boundParameterColor,
      value: {FieldShapeFromParameter: {fieldId, shapeParameterId: baseChoice.id}},
      valueForSetting: ShapesCommands.FieldShapeFromParameter(fieldId, baseChoice.id)
    };
  };
}

function listCoreShapeChoices(shapesState) {
  const coreShapeChoices = coreShapeIds.map(coreShapeId => {
    return {
      displayName: shapesState.shapes[coreShapeId].descriptor.name,
      id: coreShapeId,
    };
  });
  return coreShapeChoices;
}

export function listCoreShapeChoicesForParameter(shapesState) {
  return listCoreShapeChoices(shapesState).map(enhanceShapeChoiceForParameter);
}

export function listCoreShapeChoicesForShape(shapesState) {
  return listCoreShapeChoices(shapesState).map(enhanceChoiceForShape);
}

export function listCoreShapeChoicesForField(fieldId, shapesState) {
  return listCoreShapeChoices(shapesState).map(enhanceShapeChoiceForField(fieldId));
}

export function listConceptChoices(conceptsById, queries) {
  const conceptChoices = Object.entries(conceptsById)
    .map(([conceptShapeId, shape]) => {
      const parameterChoices = listParameterChoices(queries.shapeById(conceptShapeId));
      if (parameterChoices.length) {
        return GenericConceptChoice(shape.name, conceptShapeId, parameterChoices);
      } else {
        return ConceptChoice(shape.name, conceptShapeId);
      }
    });
  return conceptChoices;
}

export function listConceptChoicesForShape(conceptsById, queries) {
  return listConceptChoices(conceptsById, queries);
}

export function listConceptChoicesForParameter(conceptsById, blacklistedShapeIds) {
  return listConceptChoices(conceptsById, blacklistedShapeIds).map(enhanceShapeChoiceForParameter);
}

export function listConceptChoicesForField(fieldId, conceptsById, blacklistedShapeIds) {
  return listConceptChoices(conceptsById, blacklistedShapeIds).map(enhanceShapeChoiceForField(fieldId));
}


export function listParameterChoices(parentShape) {
  return parentShape.parameters
    .filter(x => !x.isRemoved)
    .map(parameter => {
      return {
        displayName: `${parentShape.name}.${parameter.name}`,
        id: parameter.shapeParameterId,
      };
    });
}

export function listParameterChoicesForParameter(parentShape) {
  return listParameterChoices(parentShape).map(enhanceParameterChoiceForParameter);
}

export function listParameterChoicesForField(fieldId, parentShape) {
  return listParameterChoices(parentShape).map(enhanceParameterChoiceForField(fieldId));
}

export function listChoicesForShape(cachedQueryResults, shapeId, blacklist) {
  const {conceptsById, shapesState} = cachedQueryResults;
  const coreShapeChoices = listCoreShapeChoicesForShape(shapesState);
  const blacklistedShapeIds = new Set(blacklist);
  const conceptChoices = listConceptChoicesForShape(conceptsById, blacklistedShapeIds);
  return [
    ...coreShapeChoices,
    ...conceptChoices,
  ];
}

export function listChoicesForParameter(cachedQueryResults, parentShape) {
  const {shapesState, conceptsById} = cachedQueryResults;
  const coreShapeChoices = listCoreShapeChoicesForParameter(shapesState);
  const parameterChoices = listParameterChoicesForParameter(parentShape);
  const conceptChoices = listConceptChoicesForParameter(conceptsById, new Set());
  return [
    ...coreShapeChoices,
    ...parameterChoices,
    ...conceptChoices
  ];
}

export function listChoicesForField(cachedQueryResults, fieldId, parentShape) {
  const {shapesState, conceptsById} = cachedQueryResults;
  const coreShapeChoices = listCoreShapeChoicesForField(fieldId, shapesState);
  const parameterChoices = listParameterChoicesForField(fieldId, parentShape);
  const conceptChoices = listConceptChoicesForField(conceptsById);
  return [
    ...coreShapeChoices,
    ...parameterChoices,
    ...conceptChoices
  ];
}
