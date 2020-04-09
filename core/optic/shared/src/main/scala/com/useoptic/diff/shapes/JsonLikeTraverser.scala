package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.ShapesHelper.ListKind
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.logging.Logger
import com.useoptic.types.capture.JsonLike
import io.circe.Json

class JsonLikeTraverser(spec: RfcState, visitors: JsonLikeVisitors) {

  def traverse(body: Option[JsonLike], bodyTrail: JsonTrail, resolvedTrail: Option[ShapeTrail]): Unit = {
    Logger.log("traversing...")
    Logger.log(body)
    Logger.log(resolvedTrail)
    if (resolvedTrail.isEmpty && body.isEmpty) {
      return
    }
    // visit unknown parts of the JSON (used during example rendering)
    if (resolvedTrail.isEmpty && body.isDefined) {
      val bodyJson = body.get
      if (bodyJson.isArray) {
        visitors.arrayVisitor.beginUnknown(bodyJson.items, bodyTrail)
        bodyJson.items.zipWithIndex.foreach{ case (item, index) => {
          val itemTrail = bodyTrail.withChild(JsonArrayItem(index))
          traverse(Some(item), itemTrail, None)
        }}
      } else if (bodyJson.isObject) {
        visitors.objectVisitor.beginUnknown(bodyJson.fields, bodyTrail)
        bodyJson.fields.foreach{ case (key, value) => {
          val fieldTrail = bodyTrail.withChild(JsonObjectKey(key))
          traverse(Some(value), fieldTrail, None)
        }}
      } else {
        visitors.primitiveVisitor.visitUnknown(Some(bodyJson), bodyTrail)
      }

      return
    }

    // normal path for parallel traversing json and spec
    val trail = resolvedTrail.get
    val resolved = Resolvers.resolveTrailToCoreShape(spec, trail)

    val bodyJson = body.get
    if (bodyJson.isArray) {
      val items = bodyJson.items
      visitors.arrayVisitor.begin(items, bodyTrail, trail, resolved)

      val listShapeId = resolved.shapeEntity.shapeId
      val resolvedItem = Resolvers.resolveParameterToShape(spec.shapesState, listShapeId, ListKind.innerParam, resolved.bindings)
      items.zipWithIndex.foreach(entry => {
        val (value, index) = entry
        val resolvedTrail = resolvedItem.flatMap(shapeEntity => {
          Some(trail.copy(path = trail.path :+ ListItemTrail(listShapeId, shapeEntity.shapeId)))
        })
        val jsonTrail = bodyTrail.withChild(JsonArrayItem(index))
        visitors.arrayVisitor.visit(index, value, jsonTrail, resolvedTrail)
        traverse(Some(value), jsonTrail, resolvedTrail)
      })

      visitors.arrayVisitor.end()
    }
    else if (bodyJson.isObject) {
      val fields = bodyJson.fields
      visitors.objectVisitor.begin(fields, bodyTrail, resolved, trail)

      fields.foreach(entry => {
        val (key, value) = entry
        //@TODO: could be a map instead of an object here, for now it'll return a None
        val resolvedField = Resolvers.tryResolveFieldFromKey(spec.shapesState, resolved.shapeEntity, key)
        val resolvedTrail = resolvedField.flatMap(fieldId => {
          //@GOTCHA need field bindings?
          val fieldShapeId = Resolvers.resolveFieldToShape(spec.shapesState, fieldId, resolved.bindings)
          Some(trail.copy(path = trail.path :+ ObjectFieldTrail(fieldId, fieldShapeId.get.shapeEntity.shapeId)))
        })
        val jsonTrail = bodyTrail.withChild(JsonObjectKey(key))

        visitors.objectVisitor.visit(key, value, bodyTrail, resolvedTrail, resolved.bindings)

        traverse(Some(value), jsonTrail, resolvedTrail)
      })

      visitors.objectVisitor.end()
    }
    else {
      visitors.primitiveVisitor.visit(Some(bodyJson), bodyTrail, Some(trail))
    }
  }
}
