package com.seamless.contexts.data_types
import Primitives.{ObjectT, PrimitiveType, RefT}
import com.seamless.contexts.data_types.Commands.ConceptId

object Validators {
  /*
  Finds Id and enforces type. If Id does not exist, also throws
   */
  def requireIdType(id: String, enforceType: PrimitiveType, reason: String)(implicit state: DataTypesState) = {
    val isValid = state.components.get(id).exists(i => i.`type` == enforceType)
    require(isValid, s"${id} must be type ${enforceType} to ${reason}")
  }

  def idExistsForSchema(id: String, schemaId: String)(implicit state: DataTypesState) = {
    require(state.components.exists(i => i._2.conceptId == schemaId && i._1 == id), s"Id ${id} does not exist in schema ${schemaId}")
  }

  def shapeExists(id: ConceptId)(implicit state: DataTypesState) = {
    require(state.components.contains(id), s"ShapeId ${id} does not exist")
  }

  def refTypeExists(newType: PrimitiveType)(implicit state: DataTypesState) = {
    if (newType.isRef) {
      state.concepts.contains(newType.asInstanceOf[RefT].conceptId)
    } else {
      true
    }
  }

  def requireIdTakesTypeParameters(id: String, reason: String)(implicit state: DataTypesState) = {
    val isValid = state.components.get(id).exists(i => i.`type`.hasTypeParameters)
    require(isValid, s"${id} must support type parameters to ${reason}")
  }

  def requireConceptId(id: String)(implicit state: DataTypesState) = {
    val isValid = state.concepts.contains(id)
    require(isValid, s"Concept ${id} does not exist")
  }

  def idIsUnused(id: String, idType: String = "Id")(implicit state: DataTypesState) = {
    val isValid = !state.components.isDefinedAt(id) && !state.concepts.exists(_._1  == id)
    require(isValid, s"${idType} ${id} is not unique")
  }

  def isValidField(field: ShapeDescription)(implicit state: DataTypesState) = {
    val isValid = field.key.isDefined && state.components.get(field.parentId).exists(i => i.`type` == ObjectT)
    require(isValid, s"Field no longer valid")
  }

  def isValidTypeParameter(typeParamId: String)(implicit state: DataTypesState) = {
    val typeParamOption = state.components.get(typeParamId)
    require(typeParamOption.isDefined, s"Type parameter ${typeParamId} not found")
    val typeParam = typeParamOption.get
    val isValid = typeParam.key.isEmpty && state.components.get(typeParam.parentId).exists(i => i.`type`.hasTypeParameters && i.typeParameters.get.contains(typeParamId))
    require(isValid, s"Type Param no longer valid")
  }

  def isValidField(fieldId: String)(implicit state: DataTypesState) = {
    val fieldOption = state.components.get(fieldId)
    require(fieldOption.isDefined, s"Field ${fieldId} not found")
    val field = fieldOption.get
    val isValid = field.key.isDefined && state.components.get(field.parentId).exists(i => i.`type`.hasFields && i.fields.get.contains(fieldId))
    require(isValid, s"Field no longer valid")
  }

}
