package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.diff.shapes.resolvers.ShapesResolvers.ChoiceOutput
import com.useoptic.types.capture.JsonLike


class JsonLikeAndSpecTraverser(resolvers: ShapesResolvers, spec: RfcState, visitors: JsonLikeAndSpecVisitors) {
  def traverseRootShape(body: Option[JsonLike], shapeId: ShapeId) = {
    val bodyTrail = JsonTrail(Seq.empty)
    val choices = resolvers.listTrailChoices(ShapeTrail(shapeId, Seq.empty), Map.empty) //@TODO: check bindings
    val trailOrigin = ShapeTrail(shapeId, Seq.empty)
    traverse(body, bodyTrail, trailOrigin, choices)
  }

  def traverse(body: Option[JsonLike], bodyTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput]): Unit = {
    if (body.isEmpty) {
      return
    }
    val bodyJson = body.get
    if (bodyJson.isArray) {
      visitors.arrayVisitor.visit(bodyJson, bodyTrail, trailOrigin, trailChoices, (choicesForArrayItems) => {
        bodyJson.items.zipWithIndex.foreach(entry => {
          val (item, index) = entry
          val itemTrail: JsonTrail = bodyTrail.withChild(JsonArrayItem(index))

          val newTrailOrigin = choicesForArrayItems.headOption match {
            case Some(choice) => choice.parentTrail
            case None => trailOrigin
          }
          if (choicesForArrayItems.nonEmpty) {
          traverse(Some(item), itemTrail, newTrailOrigin, choicesForArrayItems)
          }
        })
      })
    }
    else if (bodyJson.isObject) {
      visitors.objectVisitor.visit(bodyJson, bodyTrail, trailOrigin, trailChoices, (choicesForObject, choicesForObjectKey) => {

        visitors.objectKeyVisitor.visit(bodyTrail, bodyJson.fields, choicesForObject)
        if (choicesForObject.nonEmpty) {
          bodyJson.fields.foreach(entry => {
            val (key, value) = entry
            val itemTrail: JsonTrail = bodyTrail.withChild(JsonObjectKey(key))
            val choices = choicesForObjectKey(key)
            val newTrailOrigin = choices.headOption match {
              case Some(choice) => choice.parentTrail
              case None => trailOrigin
            }
            traverse(Some(value), itemTrail, newTrailOrigin, choicesForObjectKey(key))
          })
        }
      })
    }
    else {
      visitors.primitiveVisitor.visit(bodyJson, bodyTrail, trailOrigin, trailChoices)
    }
  }
}
