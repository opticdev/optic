package com.seamless.contexts.data_types.projections

import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Primitives.{ObjectT, PrimitiveType, RefT}
import com.seamless.contexts.data_types.{DataTypesState, ShapeDescription}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSExportAll

/*
Converts graph into tree for simpler nested rendering
 */

case class AllConcepts(allowedReferences: Vector[AllowedTypeReference], concepts: Map[ConceptId, ShapeProjection])
case class SingleConcept(allowedReferences: Vector[AllowedTypeReference], concept: ShapeProjection)

object ShapeProjection {

  def byId(state: DataTypesState, conceptId: ConceptId): SingleConcept = {
    SingleConcept(allowedRefsFromState(state), shapeProjectionById(state, conceptId)._2)
  }

  def all(state: DataTypesState): AllConcepts = {

    val allConcepts = state.concepts.map { case (conceptId, concept) =>
      shapeProjectionById(state, conceptId)
    }

    AllConcepts(allowedRefsFromState(state), allConcepts)
  }

  def allowedRefsFromState(state: DataTypesState): Vector[AllowedTypeReference] = {
    state.concepts.collect {
      case (id, concept) if concept.canBeReferenced => AllowedTypeReference(concept.name.get, id)
    }.toVector
  }

  private def shapeProjectionById(state: DataTypesState, conceptId: ConceptId): (ConceptId, ShapeProjection) = {
    val concept = state.concepts(conceptId)
    val rootComponent = state.conceptComponents(conceptId)(concept.rootId)

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

    val namedConceptOption = if (!concept.inline) Some(NamedConcept(concept.name.get, concept.deprecated, conceptId)) else None
    (conceptId, ShapeProjection(fromComponent(rootComponent, concept.rootId), namedConceptOption))
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
case class Field(key: String,
                 shape: Shape,
                 id: String,
                 optional: Boolean,
                 depth: Int,
                 override val isField: Boolean = true) extends Shape

@JSExportAll
case class ObjectShape(`type`: PrimitiveType,
                       fields: Vector[Field],
                       id: String,
                       depth: Int,
                       override val isObjectFieldList: Boolean = true
                      ) extends Shape

@JSExportAll
case class TypeParameterShape(
                 `type`: PrimitiveType,
                  typeParameters: Vector[TypeParameter],
                  id: String,
                  depth: Int,
                  override val isTypeParametersList: Boolean = true) extends Shape

@JSExportAll
case class LeafShape(`type`: PrimitiveType,
                     id: String,
                     depth: Int,
                     override val isLeaf: Boolean = true) extends Shape

@JSExportAll
case class TypeParameter(shape: Shape,
                         id: String,
                         depth: Int,
                         override val isLeaf: Boolean = true,
                         override val isTypeParameter: Boolean = true) extends Shape

@JSExportAll
case class AllowedTypeReference(name: String, id: String)

@JSExportAll
case class ShapeProjection(root: Shape, namedConcept: Option[NamedConcept])
