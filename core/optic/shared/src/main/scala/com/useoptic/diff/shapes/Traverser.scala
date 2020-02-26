package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.ShapesHelper.ListKind
import io.circe.Json

class Traverser(spec: RfcState, visitors: Visitors) {

  def traverse(body: Option[Json], bodyTrail: JsonTrail, resolvedTrail: Option[ShapeTrail]): Unit = {
    println("traversing...")
    println(body)
    println(resolvedTrail)
    if (resolvedTrail.isEmpty) {
      println("no trail...aborting traversal???")
      return
    }
    val trail = resolvedTrail.get
    val resolved = Resolvers.resolveTrailToCoreShape(spec, trail)
    println(resolved, body)
    if (body.isEmpty) {

      return
    }

    val bodyJson = body.get
    if (bodyJson.isArray) {
      val a = bodyJson.asArray.get
      visitors.arrayVisitor.begin(a, bodyTrail, resolved.shapeEntity)
      val listShapeId = resolved.shapeEntity.shapeId
      val resolvedItem = Resolvers.resolveParameterToShape(spec.shapesState, listShapeId, ListKind.innerParam, resolved.bindings)
      a.zipWithIndex.foreach(entry => {
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
      val o = bodyJson.asObject.get
      visitors.objectVisitor.begin(o, bodyTrail, resolved.shapeEntity, trail)
      val objectEntries = o.toIterable
      objectEntries.foreach(entry => {
        val (key, value) = entry
        //@TODO: could be a map instead of an object here, for now it'll return a None
        val resolvedField = Resolvers.tryResolveFieldFromKey(spec.shapesState, resolved.shapeEntity, key)

        val resolvedTrail = resolvedField.flatMap(fieldId => {
          Some(trail.copy(path = trail.path :+ ObjectFieldTrail(fieldId)))
        })
        val jsonTrail = bodyTrail.withChild(JsonObjectKey(key))

        visitors.objectVisitor.visit(key, value, bodyTrail, resolvedTrail)

        traverse(Some(value), jsonTrail, resolvedTrail)
      })
      visitors.objectVisitor.end()
    }
    else {
      visitors.primitiveVisitor.visit(bodyJson, bodyTrail, Some(trail))
    }
  }
}
