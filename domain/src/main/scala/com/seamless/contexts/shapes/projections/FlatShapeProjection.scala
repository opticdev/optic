package com.seamless.contexts.shapes.projections

import com.seamless.contexts.shapes.Commands.{DynamicParameterList, FieldId, FieldShapeFromShape, ShapeId}
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.seamless.contexts.shapes.{FlattenedShape, ShapesHelper, ShapesState}
import com.seamless.diff.ShapeDiffer
import com.seamless.diff.ShapeDiffer.resolveParameterShape
import TrailImplicits._

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.scalajs.js.annotation.JSExportAll
import scala.util.Try

object FlatShapeProjection {
  //{baseShapeId, typeName, fields, parameters, fieldName}
  @JSExportAll
  case class FlatField(fieldName: String, shape: FlatShape, fieldId: FieldId)
  @JSExportAll
  case class FlatShape(baseShapeId: ShapeId, typeName: Seq[ColoredComponent], fields: Seq[FlatField], id: ShapeId, canName: Boolean, links: Map[String, ShapeId]) {
    def joinedTypeName = typeName.map(_.name).mkString(" ")
  }
  @JSExportAll
  case class FlatShapeResult(root: FlatShape, parameterMap: Map[String, FlatShape], pathsForAffectedIds: Vector[Seq[String]])

  private val returnAny = (AnyKind.baseShapeId, FlatShape(AnyKind.baseShapeId, Seq(ColoredComponent("Any", "primitive", primitiveId = Some(AnyKind.baseShapeId))), Seq.empty, "$any", false, Map.empty))

  def forShapeId(shapeId: ShapeId, fieldIdOption: Option[String] = None, affectedIds: Seq[String] = Seq())(implicit shapesState: ShapesState, expandedName: Boolean = true) = {
    implicit val parametersByShapeId: mutable.Map[String, FlatShape] = scala.collection.mutable.HashMap[String, FlatShape]()
    implicit val trailLogger = new ShapeTrailLogger
    val root = getFlatShape(shapeId, Seq.empty)(shapesState, fieldIdOption, expandedName, parametersByShapeId, trailLogger)
    FlatShapeResult(root, parametersByShapeId.toMap, trailLogger.pathsForAffectedIds(affectedIds))
  }

  private def addLinkToParameter(shapeId: ShapeId, shape: FlatShape)(implicit shapesState: ShapesState, fieldIdOption: Option[String] = None, parametersByShapeId: mutable.Map[String, FlatShape], trailLogger: ShapeTrailLogger): Unit = {
    if (!parametersByShapeId.contains(shapeId)) {
      parametersByShapeId.put(shapeId, shape)
    }
  }

  private def getFlatShape(shapeId: ShapeId, trail: Seq[ShapeTrail])(implicit shapesState: ShapesState, fieldIdOption: Option[String], expandedName: Boolean = false, parametersByShapeId: mutable.Map[String, FlatShape], trailLogger: ShapeTrailLogger): FlatShape = {
    val shape = shapesState.flattenedShape(shapeId)

    def resolveInner(paramId: String) = resolveParameterShape(shapeId, paramId)(shapesState, {
      if (fieldIdOption.isDefined) {
        shapesState.flattenedField(fieldIdOption.get).bindings
      } else {
        shapesState.flattenedShape(shapeId).bindings
      }
    })
      .map(i => (i.shapeId, getFlatShape(i.shapeId, trail and InParameter(i.shapeId))(shapesState, None, false, parametersByShapeId, trailLogger)))
      .getOrElse(returnAny)

    def returnWith( typeName: Seq[ColoredComponent], fields: Seq[FlatField] = Seq(), canName: Boolean = false, links: Map[String, ShapeId] ) = {
      FlatShape(shape.coreShapeId, typeName, fields, shapeId, canName, links)
    }

    shape.coreShapeId match {
      case ListKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$listItem")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$listItem" -> innerShapeId))
      }
      case MapKind.baseShapeId => {
        val (keyInnerShapeId, keyFlatShape) = resolveInner("$mapKey")
        addLinkToParameter(keyInnerShapeId, keyFlatShape)

        val (valueInnerShapeId, valueFlatShape) = resolveInner("$mapValue")
        addLinkToParameter(valueInnerShapeId, valueFlatShape)

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$mapKey" -> keyInnerShapeId, "$mapValue" -> valueInnerShapeId))
      }
      case OneOfKind.baseShapeId => {
        val inners = shapesState.shapes(shapeId).descriptor.parameters match {
          case DynamicParameterList(shapeParameterIds) => shapeParameterIds
        }
        inners.map(resolveInner).foreach {
          case (innerId, innerFlatShape) => {
            addLinkToParameter(innerId, innerFlatShape)
          }
        }

        val innerLinks = inners.map(resolveInner).map(_._1).zipWithIndex.map { case (innerId, index) => index.toString -> innerId }.toMap

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = innerLinks)
      }
      case NullableKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$nullableInner")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$nullableInner" -> innerShapeId))
      }
      case OptionalKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner(OptionalKind.innerParam)
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map(OptionalKind.innerParam -> innerShapeId))
      }
      case ReferenceKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$referenceInner")
        addLinkToParameter(innerShapeId, flatShape)

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$referenceInner" -> innerShapeId))
      }
      case IdentifierKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$identifierInner")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map("$identifierInner" -> innerShapeId))
      }
      case ObjectKind.baseShapeId => {
        val baseObject = ShapeDiffer.resolveBaseObject(shapeId)(shapesState)
        val fields = baseObject.descriptor.fieldOrdering.flatMap(fieldId => {
          val field = shapesState.fields(fieldId)

          if (field.isRemoved) {
            None
          } else {
            val fieldShapeId = field.descriptor.shapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId
            val trailForFieldAndInnerShape = trail and InField(fieldId) and Leaf(fieldShapeId)
            Some(FlatField(field.descriptor.name, getFlatShape(fieldShapeId, trailForFieldAndInnerShape)(shapesState, Some(fieldId), false, parametersByShapeId, trailLogger), fieldId))
          }

        }).sortBy(_.fieldName)

        val canName = baseObject.descriptor.name == ""

        //handle generics
//        val genericParams = Try(baseObject.descriptor.parameters.asInstanceOf
//          [DynamicParameterList].shapeParameterIds).getOrElse(Seq.empty)
//
//        val generics = genericParams.flatMap(param => {
//          val seq = resolveInner(param)
//          Seq(ColoredComponent(param.split(":").last+":", "text", None)) ++ seq
//        })


        FlatShape(baseObject.descriptor.baseShapeId, NameForShapeId.getShapeName(baseObject.shapeId), fields, baseObject.shapeId, canName, Map.empty)
      }

      //fallback to primitives
      case baseShapeId if ShapesHelper.allCoreShapes.exists(_.baseShapeId == baseShapeId) =>
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map.empty)
      //fallback for unhandled -- should never be reached
      case _ => returnAny._2
    }
  }

}

class ShapeTrailLogger {
  val _all = scala.collection.mutable.ListBuffer[Seq[ShapeTrail]]()

  def finalize(id: String)(implicit trail: Seq[ShapeTrail]): Seq[ShapeTrail] = {
    val f = trail :+ Leaf(id)
    _all.append(f)
    f
  }

  def pathsForAffectedIds(affectedIds: Seq[String]): Vector[Seq[String]] = {
    _all.filter(i => i.nonEmpty && affectedIds.contains(i.last.id)).map(i => i.map(_.id)).toVector
  }

  def add(s: Seq[ShapeTrail]) = _all.append(s)
}

object TrailImplicits {

  implicit class TrailSeqImplicitsA(seq: Seq[ShapeTrail]) {
    def and(shapeTrail: ShapeTrail)(implicit trailLogger: ShapeTrailLogger): Seq[ShapeTrail] = {
      val newTrail = seq :+ shapeTrail
      trailLogger.add(newTrail)
      newTrail
    }
  }

}

sealed trait ShapeTrail {
  def id: String
}
case class InField(id: String) extends ShapeTrail
case class InParameter(id: String) extends ShapeTrail
case class Leaf(id: String) extends ShapeTrail
