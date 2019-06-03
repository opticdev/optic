package com.seamless.contexts.data_types

import com.seamless.contexts.data_types.Primitives.PrimitiveType

case class DataTypesState(components: Map[String, ShapeDescription], concepts: Map[String, ConceptDescription], creationOrder: Seq[String] = Seq("root")) {

  def putId(id: String, description: ShapeDescription) = {
    val created = !creationOrder.contains(id)
    DataTypesState(components + (id -> description), concepts, if (created) creationOrder :+ id else creationOrder)
  }

  def putConceptId(id: String, description: ConceptDescription) = {
    val created = !creationOrder.contains(id)
    DataTypesState(components, concepts + (id -> description), if (created) creationOrder :+ id else creationOrder)
  }

  def conceptComponents(conceptId: String) = {
    components.filter(i => i._2.conceptId == conceptId)
  }

  def deleteId(id: String) = {
    this.copy(components = components - id)
  }

  def updateField(fieldId: String)(updater: ShapeDescription => ShapeDescription) = {
    val fieldOption = components.find(i => i._1 == fieldId)
    require(fieldOption.isDefined, s"Field ${fieldId} not found")
    val (id, field) = fieldOption.get
    val updated = updater(field)
    Validators.isValidField(updated)(this)
    putId(id, updated)
  }

  def getPastFields(id: String) = {
    components.collect {
      case i if i._2.parentId == id && i._2.key.isDefined => i._1
    }.toSeq
  }

  def update(u: ((DataTypesState) => DataTypesState)*): DataTypesState = {
    u.foldLeft(this) { (c, updater) => updater(c) }
  }

}


case class ShapeDescription(`type`: PrimitiveType,
                            parentId: String,
                            conceptId: String,
                            key: Option[String] = None,
                            fields: Option[Seq[String]] = None,
                            typeParameters: Option[Seq[String]] = None) {

  //validation
  if (`type`.hasFields) {
    require(fields.isDefined, "Fields must be defined for type object")
  } else {
    require(fields.isEmpty, "Fields can not be set unless type is Object")
  }

  if (`type`.hasTypeParameters) {
    require(typeParameters.isDefined, s"${`type`} must have type parameters")
  } else {
    require(typeParameters.isEmpty, s"${`type`} does not accept type parameters")
  }

  //helpers
  def appendField(fieldId: String) = {
    require(`type`.hasFields && fields.isDefined, "Can not append fields to a non object")
    this.copy(fields = Some(this.fields.get :+ fieldId))
  }

  def removeField(fieldId: String) = {
    require(`type`.hasFields && fields.isDefined, "Can not remove fields to a non object")
    this.copy(fields = Some(this.fields.get.filterNot(i => i == fieldId)))
  }

  def appendTypeParameter(typeParamId: String) = {
    require(`type`.hasTypeParameters && typeParameters.isDefined, "Can not add type parameters to a type that does not support them")
    this.copy(typeParameters = Some(this.typeParameters.get :+ typeParamId))
  }

  def removeTypeParameter(typeParamId: String) = {
    require(`type`.hasTypeParameters && typeParameters.isDefined, "Can not remove type parameters for a type that does not support them")
    this.copy(typeParameters = Some(this.typeParameters.get.filterNot(i => i == typeParamId)))
  }

  def updateType(newType: PrimitiveType, pastFieldIds: Seq[String] = Seq()) = {
    //change to an object from something else
    val newTypeParameters = if (newType.hasTypeParameters) Some(Seq()) else None
    if (newType.hasFields && !`type`.hasFields) {
      this.copy(`type` = newType, fields = Some(pastFieldIds), typeParameters = newTypeParameters)
    } else {
      this.copy(`type` = newType, fields = None, typeParameters = newTypeParameters)
    }
  }
}

case class ConceptDescription(name: String,
                              root: String,
                              deprecated: Boolean = false)
