package com.useoptic.contexts.shapes.projections

import com.useoptic.contexts.shapes.Commands.{DynamicParameterList, FieldShapeFromShape, ShapeId}
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.useoptic.contexts.shapes.{ShapesHelper, ShapesState}
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.{ChangeType, ShapeDiffer}
import com.useoptic.diff.ShapeDiffer.resolveParameterShape
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.diff.shapes.{JsonTrail, JsonTrailPathComponent}
import io.circe.Json

import scala.collection.mutable
import scala.scalajs.js.annotation.JSExportAll

object ExampleProjection {

  def fromJson(json: Json, renderId: String, trailTags: TrailTags[JsonTrail] = TrailTags(Map.empty)): FlatShapeResult = {
    val result = jsonToFlatRender(json)(trailTags = trailTags)
    FlatShapeResult(result, Map(), Vector(), renderId)
  }

  private def flatPrimitive(kind: CoreShapeKind, value: String, tag: Option[ChangeType]): FlatShape = {
    val nameComponent = ColoredComponent(value, "primitive", None, primitiveId = Some(kind.baseShapeId))
    FlatShape(kind.baseShapeId, Seq(nameComponent), Seq(), kind.baseShapeId, canName = false, Map.empty, None)
  }

  private def jsonToFlatRender(json: Json)(implicit trailTags: TrailTags[JsonTrail], path: JsonTrail = JsonTrail(Seq.empty)): FlatShape = {

    def tagsForCurrent(newPath: JsonTrail): Option[ChangeType] = trailTags.trails.filterKeys(i => i.path == newPath.path).values.headOption

    val result = if (json.isString) {
      flatPrimitive(StringKind, json.toString, tagsForCurrent(path))
    } else if (json.isNumber) {
      flatPrimitive(NumberKind, json.asNumber.get.toString, tagsForCurrent(path))
    } else if (json.isBoolean) {
      flatPrimitive(BooleanKind, json.asBoolean.get.toString, tagsForCurrent(path))
    } else if (json.isNull) {
      flatPrimitive(NullableKind, "null", tagsForCurrent(path))
    } else if (json.isObject) {
      val fields = json.asObject.get.toList.sortBy(_._1)
      val objPath = path

      val missingFields = trailTags.trails.filter(_._2 == ChangeType.Removal).collect {
        case (trail, changeType) if trail.path.nonEmpty && //has trail
          trail.path.last.isInstanceOf[JsonObjectKey] && //ends with object key
          objPath.path == trail.path.dropRight(1) => { // we're in its parent
          val key = trail.path.last.asInstanceOf[JsonObjectKey].key
          FlatField(key, FlatShape(key, Seq(ColoredComponent("(missing)", "modifier", None, None)), Seq.empty, trail.toString, false, Map.empty, None), trail.toString, Some(ChangeType.Removal))
        }
      }

      flatPrimitive(ObjectKind, "Object", tagsForCurrent(objPath)).copy(
        fields = (fields.map(i => {
          val fieldPath = objPath.withChild(JsonTrailPathComponent.JsonObjectKey(i._1))
          FlatField(i._1, jsonToFlatRender(i._2)(trailTags, fieldPath), path.toString, tagsForCurrent(fieldPath))
        }) ++ missingFields).sortBy(_.fieldName)
      )

    } else if (json.isArray) {
      val items = json.asArray.get
      val arrayPath = path

      def transformItem(shape: FlatShape) = shape.copy(typeName = Seq(shape.typeName.head.copy(colorKey = "index")))

      val itemsAsFields = items.zipWithIndex.map { case (item, index) => {
        val itemTrail = arrayPath.withChild(JsonTrailPathComponent.JsonArrayItem(index))
        FlatField(index.toString, transformItem(jsonToFlatRender(item)(trailTags, itemTrail)), arrayPath.toString, tagsForCurrent(itemTrail))
      }}

      flatPrimitive(ListKind, "List", tagsForCurrent(arrayPath)).copy(
        fields = itemsAsFields
      )
    } else {
      throw new Error("Unknown JSON")
    }

    result
  }
}
