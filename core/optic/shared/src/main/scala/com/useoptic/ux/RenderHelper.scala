package com.useoptic.ux

import com.useoptic.diff.DiffResult
import com.useoptic.ux.ExampleRenderInterfaces.{ExampleArray, ExampleField, ExampleItem, ExampleObject, ExamplePrimitive, ExampleShape, KnownExampleField, MissingExampleField, UnexpectedExampleField}
import com.useoptic.ux.ShapaeRenderInterfaces.{SpecArray, SpecField, SpecObject, SpecOneOf, SpecPrimitive, SpecShape, WrappedType}
import com.useoptic.ux.SharedInterfaces.{ExampleFieldId, ExampleItemId, ExampleShapeId, SpecFieldId, SpecShapeId}
import io.circe.Json
import GetWithTypeExpectation._
import com.useoptic.contexts.shapes.ShapesHelper.{NullableKind, OptionalKind}

import scala.reflect.ClassTag
import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
class SideBySideRenderHelper(exampleShapes: Map[ExampleShapeId, ExampleShape],
                             exampleFields: Map[ExampleFieldId, ExampleField],
                             exampleItems: Map[ExampleItemId, ExampleItem],
                             val specShapes: Map[SpecShapeId, SpecShape],
                             rootExampleShape: ExampleShapeId) {

  def getRootShape: Option[RenderShape] = getExampleShape(rootExampleShape)

  def getExampleShape(exampleShapeId: ExampleShapeId): Option[RenderShape] = exampleShapes.get(exampleShapeId) map {
    case array: ExampleArray => getExampleArray(array)
    case obj: ExampleObject => getExampleObject(obj)
    case value: ExamplePrimitive => getExamplePrimitive(value)
  }

  def getExampleObject(exampleObject: ExampleObject): RenderShape = {
    val merged =
      exampleObject.knownFieldIds.map(i => {
        exampleFields.getAs[KnownExampleField](i).map { field =>
          RenderField(field.fieldName, Some(field.example), getExampleShape(field.exampleFieldId), getSpecShape(field.expectedShape), "visible", field.diffs ++ getSpecDiffs(field.specFieldId))
        }
      }) ++
        exampleObject.missingFieldIds.map(i => {
          exampleFields.getAs[MissingExampleField](i).map { field =>
            RenderField(field.fieldName, None, None, getSpecShape(field.expectedShape), "missing", field.diffs ++ getSpecDiffs(field.specFieldId))
          }
        }) ++
        exampleObject.unexpectedFieldIds.map(i => {
          exampleFields.getAs[UnexpectedExampleField](i).map { field =>
            RenderField(field.fieldName, Some(field.example), getExampleShape(field.exampleFieldId), None, "extra", field.diffs)
          }
        })


    //shape diffs in the field shape should show up on the row. 
    val withExpectedShapeDiffsMergedIn = merged.flatten.map(i => i.copy(diffs = i.diffs ++ i.exampleShape.map(_.diffs).getOrElse(Set.empty)))

    RenderShape(exampleObject.exampleObjectId, exampleObject.baseShapeId, getSpecShape(exampleObject.specObjectId), withExpectedShapeDiffsMergedIn, Seq.empty, Json.obj(),
      exampleObject.diffs ++ getSpecDiffs(exampleObject.specObjectId))
  }

  def getExamplePrimitive(value: ExamplePrimitive): RenderShape = {
    RenderShape(value.exampleId, value.baseShapeId, getSpecShape(value.specId), Seq.empty, Seq.empty, value.example, value.diffs)
  }

  def getExampleArray(exampleArray: ExampleArray): RenderShape = {

    val listItemShapeOption = getSpecShape(exampleArray.specArrayItemId)

    val items = exampleArray.items.flatMap(i => {
      val exampleItemOption = exampleItems.getAs[ExampleItem](i)
      if (exampleItemOption.isDefined) {
        val exampleItem = exampleItemOption.get
        Some(
          RenderItem(exampleItem.exampleItemId, exampleItem.index, getExampleShape(exampleItem.exampleItemId).get, listItemShapeOption, exampleItem.example, exampleItem.diffs)
        )
      } else {
        None
      }
    })

    RenderShape(exampleArray.exampleArrayId, exampleArray.baseShapeId, getSpecShape(exampleArray.specArrayId), Seq.empty, items, Json.arr(), exampleArray.diffs)
  }


  def getSpecDiffs(o: Option[SpecShapeId]): Set[DiffResult] = o.flatMap(specShapes.get).map(_.diffs).getOrElse(Set.empty)
  def getSpecDiffs(o: SpecShapeId): Set[DiffResult] = specShapes.get(o).map(_.diffs).getOrElse(Set.empty)

  def getSpecShape(specShapeIdOption: Option[SpecShapeId]): Option[RenderSpecBase] = if (specShapeIdOption.isDefined) getSpecShape(specShapeIdOption.get) else None
  def getSpecShape(specShapeId: SpecShapeId): Option[RenderSpecBase] = specShapes.get(specShapeId) map {
    case obj: SpecObject =>{
      RenderSpecObject(obj.specObjectId, obj.baseShapeId, obj.fields, obj.name, obj.diffs)
    }
    case field: SpecField => {
      RenderSpecField(field.specFieldId, field.fieldName, getSpecShape(field.expectedShape).get, field.diffs)
    }
    case array: SpecArray => {
      RenderSpecList(
        array.specArrayId,
        array.baseShapeId,
        getSpecShape(array.specArrayItemId).get,
        array.name,
        array.diffs
      )
    }
    case prim: SpecPrimitive =>{
      RenderSpecValue(prim.specShapeId, prim.baseShapeId, prim.name, prim.diffs)
    }
    //@todo these
    case oneOf: SpecOneOf => {
      RenderOneOfValue(oneOf.specShapeId, oneOf.baseShapeId, oneOf.branches.map(getSpecShape).flatten, oneOf.name, oneOf.diffs)
    }
    case wrapper: WrappedType => {
      RenderWrapperValue(wrapper.specShapeId, wrapper.baseShapeId, getSpecShape(wrapper.innerId).get, wrapper.name, wrapper.diffs)
    }
  }

}

@JSExportAll
class ShapeOnlyRenderHelper(val specShapes: Map[SpecShapeId, SpecShape], rootShape: SpecFieldId) {

}

@JSExportAll
case class RenderShape(id: String, baseShapeId: String, specShape: Option[RenderSpecBase], fields: Seq[RenderField], items: Seq[RenderItem], example: Json, diffs: Set[DiffResult]) {
  def isOptional = baseShapeId == OptionalKind.baseShapeId
  def isNullable = baseShapeId == NullableKind.baseShapeId
  def itemsWithHidden(showAll: Boolean) = {
    if (showAll) {
      items
    } else {
      items.zipWithIndex.map {
        case (i, index) => if (index < 5) i else i.copy(display = "hidden")
      }
    }
  }
}
@JSExportAll
case class RenderItem(exampleItemId: ExampleItemId, index: Int, exampleShape: RenderShape, specListItem: Option[RenderSpecBase], example: Json, diffs: Set[DiffResult], display: String = "visible")
@JSExportAll
case class RenderField(fieldName: String, example: Option[Json], exampleShape: Option[RenderShape], specShape: Option[RenderSpecBase], display: String, diffs: Set[DiffResult])


trait RenderSpecBase {
  def baseShapeId: String
  def isOptional = baseShapeId == OptionalKind.baseShapeId
  def isNullable = baseShapeId == NullableKind.baseShapeId
}
@JSExportAll
case class RenderSpecObject(shapeId: String, baseShapeId: String, fields: Seq[SpecField], name: RenderName, diffs: Set[DiffResult]) extends RenderSpecBase
@JSExportAll
case class RenderSpecList(shapeId: String, baseShapeId: String, expectedListItem: RenderSpecBase, name: RenderName, diffs: Set[DiffResult]) extends RenderSpecBase
@JSExportAll
case class RenderSpecField(specFieldId: SpecFieldId, fieldName: String, shape: RenderSpecBase, diffs: Set[DiffResult]) extends RenderSpecBase {
  override def baseShapeId: String = shape.baseShapeId
}
@JSExportAll
case class RenderSpecValue(specFieldId: SpecFieldId, baseShapeId: String, name: RenderName, diffs: Set[DiffResult]) extends RenderSpecBase
@JSExportAll
case class RenderWrapperValue(specFieldId: SpecFieldId, baseShapeId: String, innerShape: RenderSpecBase, name: RenderName, diffs: Set[DiffResult]) extends RenderSpecBase
@JSExportAll
case class RenderOneOfValue(specFieldId: SpecFieldId, baseShapeId: String, branches: Seq[RenderSpecBase], name: RenderName, diffs: Set[DiffResult]) extends RenderSpecBase


object GetWithTypeExpectation {
  implicit class FieldMap[T](map: Map[String, T]) {
    def getAs[B : ClassTag](k: String): Option[B] =
      map.get(k).flatMap {
        case t: B => Some(t)
        case _ => None
      }

  }
}

object RenderTester {
  implicit class RS(renderShape: RenderShape) {
    def field(fieldName: String) = renderShape.fields.find(_.fieldName == fieldName).get
  }
  implicit class RSOp(renderShape: Option[RenderShape]) {
    def field(fieldName: String) = renderShape.get.fields.find(_.fieldName == fieldName).get
  }
}
