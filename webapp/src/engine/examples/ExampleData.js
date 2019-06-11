import {Commands, newRfcService, Primitives, DataTypesHelper} from '../index'

export function seedExampleUserWriteModel(handler, schemaName, aggregateId = 'test-api') {

	const conceptId = DataTypesHelper.newConceptId()
	const conceptRootShapeId = DataTypesHelper.newId()
	handler(Commands.DefineConcept(schemaName, conceptRootShapeId, conceptId))

	function addFieldOfType(fieldName, type, root) {
		const fieldId = DataTypesHelper.newId()
		handler(Commands.AddField(root, fieldId, conceptId))
		handler(Commands.AssignType(fieldId, type, conceptId))
		handler(Commands.SetFieldName(fieldId, fieldName, conceptId))
		return fieldId
	}
	//
	addFieldOfType('username', Primitives.StringT(), conceptRootShapeId)
	addFieldOfType('email', Primitives.StringT(), conceptRootShapeId)
	addFieldOfType('age', Primitives.NumberT(), conceptRootShapeId)
	const featuresId = addFieldOfType('features', Primitives.ObjectT(), conceptRootShapeId)

	addFieldOfType('eye-color', Primitives.StringT(), featuresId)
	addFieldOfType('skin-color', Primitives.StringT(), featuresId)
	const heightId = addFieldOfType('height', Primitives.ObjectT(), conceptRootShapeId)

	addFieldOfType('scalar', Primitives.NumberT(), heightId)
	addFieldOfType('units', Primitives.StringT(), heightId)


	const friendsId = addFieldOfType('friends', Primitives.ListT(), conceptRootShapeId)
	const typeParam1Id = DataTypesHelper.newId()
	handler(Commands.AddTypeParameter(friendsId, typeParam1Id, conceptId))
	handler(Commands.AssignType(typeParam1Id, DataTypesHelper.refTo('concept_friends'), conceptId))

	return conceptId
}

export function seedFriendModel(handler, aggregateId = 'test-api') {

	const conceptId = 'concept_friends'
	const conceptRootShapeId = DataTypesHelper.newId()
	handler(Commands.DefineConcept("FriendSlim", conceptRootShapeId, conceptId))

	function addFieldOfType(fieldName, type, root) {
		const fieldId = DataTypesHelper.newId()
		handler(Commands.AddField(root, fieldId, conceptId))
		handler(Commands.AssignType(fieldId, type, conceptId))
		handler(Commands.SetFieldName(fieldId, fieldName, conceptId))
		return fieldId
	}

	addFieldOfType('username', Primitives.StringT(), conceptRootShapeId)
	addFieldOfType('email', Primitives.StringT(), conceptRootShapeId)
	addFieldOfType('friends-since', Primitives.StringT(), conceptRootShapeId)

	return conceptId
}

export function seedString(handler, name, aggregateId = 'test-api') {

	const conceptId = `concept_${name}`
	const conceptRootShapeId = DataTypesHelper.newId()
	handler(Commands.DefineInlineConcept(conceptRootShapeId, conceptId))


	handler(Commands.AssignType(conceptRootShapeId, Primitives.StringT(), conceptId))

	return conceptId
}
