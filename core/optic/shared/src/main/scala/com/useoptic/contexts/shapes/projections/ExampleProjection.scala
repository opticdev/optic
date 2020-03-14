package com.useoptic.contexts.shapes.projections

import com.useoptic.contexts.shapes.Commands.{DynamicParameterList, FieldShapeFromShape, ShapeId}
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.contexts.shapes.projections.NameForShapeId.ColoredComponent
import com.useoptic.contexts.shapes.{ShapesHelper, ShapesState}
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.ChangeType
import com.useoptic.diff.interactions.ShapeRelatedDiff
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.diff.shapes.{JsonTrail, JsonTrailPathComponent, ShapeDiffResult}
import io.circe.Json

import scala.collection.mutable
import scala.scalajs.js.annotation.JSExportAll

object ExampleProjection {

  def fromJson(json: Json, renderId: String, trailTags: TrailTags[JsonTrail] = TrailTags(Map.empty), shapeDiffs: Seq[ShapeRelatedDiff] = Seq.empty): FlatShapeResult = {
    val result = jsonToFlatRender(json)(trailTags = trailTags, JsonTrail(Seq.empty), shapeDiffs)
    FlatShapeResult(result, Map(), Vector(), renderId)
  }

  private def flatPrimitive(kind: CoreShapeKind, value: String, tag: Option[ChangeType], shapeDiffs: Seq[ShapeRelatedDiff]): FlatShape = {
    val nameComponent = ColoredComponent(value, "primitive", None, primitiveId = Some(kind.baseShapeId))
    FlatShape(kind.baseShapeId, Seq(nameComponent), Seq(), kind.baseShapeId, canName = false, Map.empty, None, shapeDiffs)
  }

  private def jsonToFlatRender(json: Json)(implicit trailTags: TrailTags[JsonTrail], path: JsonTrail = JsonTrail(Seq.empty), shapeDiffs: Seq[ShapeRelatedDiff]): FlatShape = {

    def tagsForCurrent(newPath: JsonTrail): Option[ChangeType] = trailTags.trails.filterKeys(i => i.path == newPath.path).values.headOption
    def shapeDiffsForCurrent(newPath: JsonTrail): Seq[ShapeRelatedDiff] = shapeDiffs.filter(i => i.shapeDiffResult.jsonTrail.path == newPath.path)

    val result = if (json.isString) {
      flatPrimitive(StringKind, json.toString, tagsForCurrent(path), shapeDiffsForCurrent(path))
    } else if (json.isNumber) {
      flatPrimitive(NumberKind, json.asNumber.get.toString, tagsForCurrent(path), shapeDiffsForCurrent(path))
    } else if (json.isBoolean) {
      flatPrimitive(BooleanKind, json.asBoolean.get.toString, tagsForCurrent(path), shapeDiffsForCurrent(path))
    } else if (json.isNull) {
      flatPrimitive(NullableKind, "null", tagsForCurrent(path), shapeDiffsForCurrent(path))
    } else if (json.isObject) {
      val fields = json.asObject.get.toList.sortBy(_._1)
      val objPath = path

      val missingFields = trailTags.trails.filter(_._2 == ChangeType.Removal).collect {
        case (trail, changeType) if trail.path.nonEmpty && //has trail
          trail.path.last.isInstanceOf[JsonObjectKey] && //ends with object key
          objPath.path == trail.path.dropRight(1) => { // we're in its parent
          val key = trail.path.last.asInstanceOf[JsonObjectKey].key
          FlatField(key, FlatShape(key, Seq(ColoredComponent("(missing)", "modifier", None, None)), Seq.empty, trail.toString, false, Map.empty, None, Seq.empty), trail.toString, Some(ChangeType.Removal), shapeDiffsForCurrent(trail))
        }
      }

      flatPrimitive(ObjectKind, "Object", tagsForCurrent(objPath), shapeDiffsForCurrent(objPath)).copy(
        fields = (fields.map(i => {
          val fieldPath = objPath.withChild(JsonTrailPathComponent.JsonObjectKey(i._1))
          FlatField(i._1, jsonToFlatRender(i._2)(trailTags, fieldPath, shapeDiffs), path.toString, tagsForCurrent(fieldPath), shapeDiffsForCurrent(fieldPath))
        }) ++ missingFields).sortBy(_.fieldName)
      )

    } else if (json.isArray) {
      val items = json.asArray.get
      val arrayPath = path

      def transformItem(shape: FlatShape) = shape.copy(typeName = Seq(shape.typeName.head.copy(colorKey = "index")))

      val itemsAsFields = items.zipWithIndex.map { case (item, index) => {
        val itemTrail = arrayPath.withChild(JsonTrailPathComponent.JsonArrayItem(index))
        FlatField(index.toString, transformItem(jsonToFlatRender(item)(trailTags, itemTrail, shapeDiffs)), arrayPath.toString, tagsForCurrent(itemTrail), shapeDiffsForCurrent(itemTrail))
      }}

      flatPrimitive(ListKind, "List", tagsForCurrent(arrayPath), shapeDiffsForCurrent(arrayPath)).copy(
        fields = itemsAsFields
      )
    } else {
      throw new Error("Unknown JSON")
    }

    result
  }
}
