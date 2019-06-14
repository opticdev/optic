package com.seamless.contexts.data_types.projections

import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Primitives.{ObjectT, PrimitiveType, RefT}
import com.seamless.contexts.data_types.{DataTypesState, ShapeDescription}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSExportAll

/*
Converts graph into tree for simpler nested rendering
 */

object ShapeProjection {

  def fromState(state: DataTypesState, conceptId: String): ShapeProjection = {

    val concept = state.concepts(conceptId)
    val rootComponent = state.conceptComponents(conceptId)(concept.root)

    def isOptionalInContext(id: ConceptId) = {
      rootComponent.optionalChildren.contains(id)
    }

    def fromComponent(description: ShapeDescription, id: String, lastDepth: Int = -1): Shape = {
      val depth = lastDepth + 1
      description.`type` match {
        case ObjectT => {
          val fields = description.fields.get.map(i => {
            val (fieldId, fDesc) = state.components.find(c => c._1 == i).get
            Field(fDesc.key.get, fromComponent(fDesc, fieldId, depth), fieldId, isOptionalInContext(fieldId), depth + 1)
          })
          .sortBy(f => state.creationOrder.indexOf(f))
          .toVector

          ObjectShape(description.`type`, fields, id, depth)
        }
        case t if t.hasTypeParameters => {
          val parameters = description.typeParameters.getOrElse(Vector.empty).map(id => {
            val desc = state.components(id)
            TypeParameter(fromComponent(desc, id, depth), id, depth + 1)
          }).toVector

          TypeParameterShape(description.`type`, parameters, id, depth)
        }
        case _ => {
          LeafShape(description.`type`, id, depth)
        }
      }
    }

    val allowedTypeReferences = state.concepts.collect {case (id, concept) if !concept.deprecated && !concept.inline =>

      val dependentConcepts = state.components.collect{
        case (depId, dep) if dep.`type`.isRef && dep.`type`.asInstanceOf[RefT].conceptId == id =>
          dep.conceptId
      }.toSet

      AllowedTypeReference(concept.name.get, id, dependentConcepts.toVector)
    }.toVector
      .sortBy(_._dependents.length)
      .reverse

    ShapeProjection(fromComponent(rootComponent, concept.root), allowedTypeReferences)

  }

}

@JSExportAll
sealed trait Shape {
  def id: String
  def depth: Int

  def isField: Boolean = false
  def isTypeParameter: Boolean = false
  def isObjectFieldList: Boolean = false
  def isTypeParametersList: Boolean = false
  def isLeaf: Boolean = false
}

@JSExportAll
case class Field(key: String, shape: Shape, id: String, optional: Boolean, depth: Int) extends Shape { override def isField = true }

@JSExportAll
case class ObjectShape(`type`: PrimitiveType, _fields: Vector[Field], id: String, depth: Int) extends Shape {
  override def isObjectFieldList = true
  def fields: js.Array[Field] = {
    import js.JSConverters._
    _fields.toJSArray
  }
}

@JSExportAll
case class TypeParameterShape(`type`: PrimitiveType, _typeParameters: Vector[TypeParameter], id: String, depth: Int) extends Shape {
  override def isTypeParametersList = true
  def typeParameters: js.Array[TypeParameter] = {
    import js.JSConverters._
    _typeParameters.toJSArray
  }
}

@JSExportAll
case class LeafShape(`type`: PrimitiveType, id: String, depth: Int) extends Shape { override def isLeaf: Boolean = true }

@JSExportAll
case class TypeParameter(shape: Shape, id: String, depth: Int) extends Shape {
  override def isLeaf: Boolean = true
  override def isTypeParameter: Boolean = true
}

@JSExportAll
case class AllowedTypeReference(name: String, id: String, _dependents: Vector[String]) {
  def dependents: js.Array[String] = {
    import js.JSConverters._
    _dependents.toJSArray
  }
}

@JSExportAll
case class ShapeProjection(root: Shape, _allowedTypeReferences: Vector[AllowedTypeReference]) {
  def allowedTypeReferences: js.Array[AllowedTypeReference] = {
    import js.JSConverters._
    _allowedTypeReferences.toJSArray
  }
}
