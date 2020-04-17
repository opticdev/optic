package com.useoptic.ux

import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.ShapesHelper.{AnyKind, CoreShapeKind, ListKind, ObjectKind, OneOfKind}
import com.useoptic.diff.DiffResult
import com.useoptic.ux.SharedInterfaces._
import io.circe.Json

object SharedInterfaces {
  type SpecShapeId = ShapeId
  type SpecFieldId = ShapeId
  type ExampleShapeId = String
  type ExampleFieldId = String
  type ExampleItemId = String
}

object ExampleRenderInterfaces {

  trait ExampleShape {
    def exampleId: ExampleShapeId
    def baseShapeId: String
  }

  case class ExampleObject(exampleObjectId: ExampleShapeId, specObjectId: Option[SpecShapeId], knownFieldIds: Seq[ExampleFieldId], missingFieldIds: Seq[ExampleFieldId], unexpectedFieldIds: Seq[ExampleFieldId], diffs: Set[DiffResult]) extends ExampleShape {
    override def exampleId: ExampleShapeId = exampleObjectId
    def baseShapeId: ShapeId = ObjectKind.baseShapeId
  }

  trait ExampleField { def exampleFieldId: ExampleFieldId }
  case class KnownExampleField(exampleFieldId: ExampleFieldId, fieldName: String, specFieldId: SpecFieldId, expectedShape: SpecShapeId, example: Json, diffs: Set[DiffResult]) extends ExampleField
  case class MissingExampleField(exampleFieldId: ExampleFieldId /* what it would be */, fieldName: String, specFieldId: SpecFieldId, expectedShape: SpecShapeId, diffs: Set[DiffResult]) extends ExampleField
  case class UnexpectedExampleField(exampleFieldId: ExampleFieldId, fieldName: String, example: Json, diffs: Set[DiffResult]) extends ExampleField

  case class ExampleArray(exampleArrayId: ExampleShapeId, specArrayId: Option[SpecShapeId], specArrayItemId: Option[SpecShapeId], items: Seq[ExampleItemId], diffs: Set[DiffResult]) extends ExampleShape {
    override def exampleId: ExampleShapeId = exampleArrayId
    def baseShapeId: ShapeId = ListKind.baseShapeId
  }
  case class ExampleItem(exampleItemId: ExampleItemId, index: Int, example: Json, diffs: Set[DiffResult])

  case class ExamplePrimitive(exampleId: ExampleShapeId, baseShapeId: String, specId: Option[SpecShapeId], example: Json, diffs: Set[DiffResult]) extends ExampleShape


  trait ExampleRenderVisitorHelper {
    private val _fields = scala.collection.mutable.Map[String, ExampleField]()
    private val _shapes = scala.collection.mutable.Map[String, ExampleShape]()
    private val _items = scala.collection.mutable.Map[String, ExampleItem]()

    private var _firstShape: Option[ExampleShape] = None

    def rootShape: ExampleShape = _firstShape.get

    def fields: Map[String, ExampleField] = _fields.toMap

    def pushField(renderField: ExampleField): Unit = _fields.put(renderField.exampleFieldId, renderField)

    def shapes: Map[String, ExampleShape] = _shapes.toMap

    def pushShape(renderShape: ExampleShape): Unit = {
      if (_shapes.isEmpty) {
        _firstShape = Some(renderShape)
      }
      _shapes.put(renderShape.exampleId, renderShape)
    }

    def items: Map[String, ExampleItem] = _items.toMap

    def pushItem(renderItem: ExampleItem): Unit = _items.put(renderItem.exampleItemId, renderItem)
  }

}






object ShapaeRenderInterfaces {

  trait SpecShape {
    def specShapeId: ExampleShapeId
    def baseShapeId: String
    def name: RenderName
    def diffs: Set[DiffResult]
  }

  case class SpecObject(specObjectId: SpecShapeId, fields: Seq[SpecField], diffs: Set[DiffResult]) extends SpecShape {
    override def specShapeId: SpecShapeId = specObjectId
    def baseShapeId: ShapeId = ObjectKind.baseShapeId
    def name: RenderName = RenderName(Seq(NameComponent(ObjectKind.name, ObjectKind.color)))
  }

  case class SpecField(fieldName: String, specFieldId: SpecFieldId, expectedShape: SpecShapeId, diffs: Set[DiffResult])

  case class SpecArray(specArrayId: SpecShapeId, specArrayItemId: SpecShapeId, diffs: Set[DiffResult]) extends SpecShape {
    override def specShapeId: SpecShapeId = specArrayId
    def baseShapeId: ShapeId = ListKind.baseShapeId
    def name: RenderName = RenderName(Seq(NameComponent(ListKind.name, ListKind.color)))
  }

  case class SpecPrimitive(specShapeId: SpecShapeId, baseShapeId: String, name: RenderName, diffs: Set[DiffResult]) extends SpecShape
  case class SpecOneOf(specShapeId: SpecShapeId, name: RenderName, branches: Seq[SpecShapeId], diffs: Set[DiffResult]) extends SpecShape {
    def baseShapeId: ShapeId = OneOfKind.baseShapeId
  }

  case class WrappedType(specShapeId: SpecShapeId, baseShapeId: ShapeId, name: RenderName, innerId: SpecShapeId, diffs: Set[DiffResult]) extends SpecShape

  trait SpecRenderVisitorHelper {
    private val _shapes = scala.collection.mutable.Map[String, SpecShape]()

    private var _firstShape: Option[SpecShape] = None

    def rootShape: SpecShape = _firstShape.get

    def shapes: Map[String, SpecShape] = _shapes.toMap

    def pushShape(renderShape: SpecShape): Unit = {
      if (_shapes.isEmpty) {
        _firstShape = Some(renderShape)
      }
      _shapes.put(renderShape.specShapeId, renderShape)
    }
  }


}
