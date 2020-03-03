package com.useoptic.contexts.shapes.projections

import com.useoptic.contexts.shapes.Commands.{DynamicParameterList, FieldId, FieldShapeFromShape, ShapeId}
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.useoptic.contexts.shapes.{FlattenedShape, ShapesHelper, ShapesState}
import com.useoptic.diff.ShapeDiffer
import com.useoptic.diff.ShapeDiffer.resolveParameterShape
import scala.collection.mutable

object FlatShapeProjection {
  private val returnAny = (AnyKind.baseShapeId, FlatShape(AnyKind.baseShapeId, Seq(ColoredComponent("Any", "primitive", primitiveId = Some(AnyKind.baseShapeId))), Seq.empty, "$any", false, Map.empty, None))

  def forShapeId(shapeId: ShapeId, fieldIdOption: Option[String] = None, affectedIds: Seq[String] = Seq())(implicit shapesState: ShapesState, expandedName: Boolean = true, revision: Int = 0) = {
    implicit val parametersByShapeId: mutable.Map[String, FlatShape] = scala.collection.mutable.HashMap[String, FlatShape]()
    val root = getFlatShape(shapeId)(shapesState, fieldIdOption, expandedName, parametersByShapeId)
    FlatShapeResult(root, parametersByShapeId.toMap, Vector(), s"${shapeId}_${revision.toString}")
  }

  private def addLinkToParameter(shapeId: ShapeId, shape: FlatShape)(implicit shapesState: ShapesState, fieldIdOption: Option[String] = None, parametersByShapeId: mutable.Map[String, FlatShape]): Unit = {
    if (!parametersByShapeId.contains(shapeId)) {
      parametersByShapeId.put(shapeId, shape)
    }
  }

  private def getFlatShape(shapeId: ShapeId)(implicit shapesState: ShapesState, fieldIdOption: Option[String], expandedName: Boolean = false, parametersByShapeId: mutable.Map[String, FlatShape]): FlatShape = {
    val shape = shapesState.flattenedShape(shapeId)

    def resolveInner(paramId: String) = resolveParameterShape(shapeId, paramId)(shapesState, {
      if (fieldIdOption.isDefined) {
        shapesState.flattenedField(fieldIdOption.get).bindings
      } else {
        shapesState.flattenedShape(shapeId).bindings
      }
    })
      .map(i => (i.shapeId, getFlatShape(i.shapeId)(shapesState, None, false, parametersByShapeId)))
      .getOrElse(returnAny)

    def returnWith( typeName: Seq[ColoredComponent], fields: Seq[FlatField] = Seq(), canName: Boolean = false, links: Map[String, ShapeId] ) = {
      FlatShape(shape.coreShapeId, typeName, fields, shapeId, canName, links, None)
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
            Some(FlatField(field.descriptor.name, getFlatShape(fieldShapeId)(shapesState, Some(fieldId), false, parametersByShapeId), fieldId, None))
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


        FlatShape(baseObject.descriptor.baseShapeId, NameForShapeId.getShapeName(baseObject.shapeId), fields, baseObject.shapeId, canName, Map.empty, None)
      }
      //fallback to primitives
      case baseShapeId if ShapesHelper.allCoreShapes.exists(_.baseShapeId == baseShapeId) =>
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), links = Map.empty)
      //fallback for unhandled -- should never be reached
      case _ => returnAny._2
    }
  }

}
