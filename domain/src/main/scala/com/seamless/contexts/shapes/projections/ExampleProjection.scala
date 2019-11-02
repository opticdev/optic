package com.seamless.contexts.shapes.projections

import com.seamless.contexts.shapes.Commands.{DynamicParameterList, FieldShapeFromShape, ShapeId}
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.projections.FlatShapeProjection.{FlatField, FlatShape, FlatShapeResult}
import com.seamless.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.seamless.contexts.shapes.{ShapesHelper, ShapesState}
import com.seamless.diff.ShapeDiffer
import com.seamless.diff.ShapeDiffer.resolveParameterShape
import io.circe.Json

import scala.collection.mutable
import scala.scalajs.js.annotation.JSExportAll

object ExampleProjection {

  def fromJson(json: Json): FlatShapeResult = {
    val result = jsonToFlatRender(json)(Seq())
    FlatShapeResult(result, Map())
  }

  private def flatPrimitive(kind: CoreShapeKind, value: String): FlatShape = {
    val nameComponent = ColoredComponent(value, "primitive", None, primitiveId = Some(kind.baseShapeId))
    FlatShape(kind.baseShapeId, Seq(nameComponent), Seq())
  }

  private def jsonToFlatRender(json: Json)(implicit path: Seq[String]): FlatShape = {

    val result = if (json.isString) {
      flatPrimitive(StringKind, json.toString)
    } else if (json.isNumber) {
      flatPrimitive(NumberKind, json.asNumber.get.toString)
    } else if (json.isBoolean) {
      flatPrimitive(BooleanKind, json.asBoolean.get.toString)
    } else if (json.isNull) {
      flatPrimitive(NullableKind, "null")
    } else if (json.isObject) {
      val fields = json.asObject.get.toList
      flatPrimitive(ObjectKind, "Object").copy(
        fields = fields.map(i => FlatField(i._1, jsonToFlatRender(i._2)(path :+ i._1)))
      )
    } else if (json.isArray) {
      val items = json.asArray.get

      def transformItem(shape: FlatShape) = shape.copy(typeName = Seq(shape.typeName.head.copy(colorKey = "index")))

      val itemsAsFields = items.zipWithIndex.map { case (item, index) => {
        FlatField(index.toString, transformItem(jsonToFlatRender(item)(path :+ s"[${index}]")))
      }}

      flatPrimitive(ListKind, "List").copy(
        fields = itemsAsFields
      )
    } else {
      throw new Error("Unknown JSON")
    }

    result
  }
}
