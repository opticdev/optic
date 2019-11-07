package com.seamless.contexts.shapes.projections

import com.seamless.contexts.shapes.Commands.{DynamicParameterList, FieldId, FieldShapeFromShape, ShapeId}
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.seamless.contexts.shapes.{FlattenedShape, ShapesHelper, ShapesState}
import com.seamless.diff.ShapeDiffer
import com.seamless.diff.ShapeDiffer.resolveParameterShape

import scala.collection.mutable
import scala.scalajs.js.annotation.JSExportAll
import scala.util.Try

object FlatShapeProjection {
  //{baseShapeId, typeName, fields, parameters, fieldName}
  @JSExportAll
  case class FlatField(fieldName: String, shape: FlatShape, fieldId: FieldId)
  @JSExportAll
  case class FlatShape(baseShapeId: ShapeId, typeName: Seq[ColoredComponent], fields: Seq[FlatField], id: ShapeId, canName: Boolean) {
    def joinedTypeName = typeName.map(_.name).mkString(" ")
  }
  @JSExportAll
  case class FlatShapeResult(root: FlatShape, parameterMap: Map[String, FlatShape])

  private val returnAny = (AnyKind.baseShapeId, FlatShape(AnyKind.baseShapeId, Seq(ColoredComponent("Any", "primitive", primitiveId = Some(AnyKind.baseShapeId))), Seq.empty, "$any", false))

  def forShapeId(shapeId: ShapeId, fieldIdOption: Option[String] = None)(implicit shapesState: ShapesState, expandedName: Boolean = true) = {
    implicit val parametersByShapeId: mutable.Map[String, FlatShape] = scala.collection.mutable.HashMap[String, FlatShape]()
    val root = getFlatShape(shapeId)(shapesState, fieldIdOption, expandedName, parametersByShapeId)
    FlatShapeResult(root, parametersByShapeId.toMap)
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

    def returnWith( typeName: Seq[ColoredComponent], fields: Seq[FlatField] = Seq(), canName: Boolean = false ) = {
      FlatShape(shape.baseShapeId, typeName, fields, shapeId, canName)
    }

    shape.coreShapeId match {
      case ListKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$listItem")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      }
      case MapKind.baseShapeId => {
        val (keyInnerShapeId, keyFlatShape) = resolveInner("$mapKey")
        addLinkToParameter(keyInnerShapeId, keyFlatShape)

        val (valueInnerShapeId, valueFlatShape) = resolveInner("$mapValue")
        addLinkToParameter(valueInnerShapeId, valueFlatShape)

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
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

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      }
      case NullableKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$nullableInner")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      }
      case OptionalKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$optionalInner")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      }
      case ReferenceKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$referenceInner")
        addLinkToParameter(innerShapeId, flatShape)

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      }
      case IdentifierKind.baseShapeId => {
        val (innerShapeId, flatShape) = resolveInner("$identifierInner")
        addLinkToParameter(innerShapeId, flatShape)
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      }
      case ObjectKind.baseShapeId => {
        val baseObject = ShapeDiffer.resolveBaseObject(shapeId)(shapesState)
        val fields = baseObject.descriptor.fieldOrdering.map(fieldId => {
          val field = shapesState.fields(fieldId)
          FlatField(field.descriptor.name, getFlatShape( field.descriptor.shapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId)(shapesState, Some(fieldId), false, parametersByShapeId), fieldId)
        })

        val canName = baseObject.descriptor.name == ""

        //handle generics
//        val genericParams = Try(baseObject.descriptor.parameters.asInstanceOf
//          [DynamicParameterList].shapeParameterIds).getOrElse(Seq.empty)
//
//        val generics = genericParams.flatMap(param => {
//          val seq = resolveInner(param)
//          Seq(ColoredComponent(param.split(":").last+":", "text", None)) ++ seq
//        })

        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName), fields, canName)
      }

      //fallback to primitives
      case baseShapeId if ShapesHelper.allCoreShapes.exists(_.baseShapeId == baseShapeId) =>
        returnWith(NameForShapeId.getShapeName(shapeId, expand = expandedName))
      //fallback for unhandled -- should never be reached
      case _ => returnAny._2
    }
  }

}
