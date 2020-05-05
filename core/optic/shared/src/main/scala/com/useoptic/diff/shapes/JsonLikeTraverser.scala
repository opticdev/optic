package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.ShapesHelper.ListKind
import com.useoptic.diff.shapes.JsonTrailPathComponent.{JsonArrayItem, JsonObjectKey}
import com.useoptic.diff.shapes.Resolvers.ChoiceOutput
import com.useoptic.logging.Logger
import com.useoptic.types.capture.JsonLike
import io.circe.Json

abstract class GenericJsonVisitor {
  def visit(value: JsonLike, bodyTrail: JsonTrail)
}

class JsonLikeTraverser(spec: RfcState, visitors: JsonLikeVisitors) {

  def traverse(body: Option[JsonLike], bodyTrail: JsonTrail): Unit = {
    if (body.isDefined) {
      val bodyJson = body.get
      if (bodyJson.isArray) {
        visitors.arrayVisitor.visit(bodyJson, bodyTrail)
        bodyJson.items.zipWithIndex.foreach{ case (item, index) => {
          val itemTrail = bodyTrail.withChild(JsonArrayItem(index))
          traverse(Some(item), itemTrail)
        }}
      } else if (bodyJson.isObject) {
        visitors.objectVisitor.visit(bodyJson, bodyTrail)
        bodyJson.fields.foreach{ case (key, value) => {
          val fieldTrail = bodyTrail.withChild(JsonObjectKey(key))
          traverse(Some(value), fieldTrail)
        }}
      } else {
        visitors.primitiveVisitor.visit(bodyJson, bodyTrail)
      }
    }
  }
}

class JsonLikeTraverserWithSpecStubs(spec: RfcState, visitors: JsonLikeAndSpecVisitors) {

  def traverse(body: Option[JsonLike], bodyTrail: JsonTrail): Unit = {
    if (body.isDefined) {
      val bodyJson = body.get
      if (bodyJson.isArray) {
        visitors.arrayVisitor.visit(bodyJson, bodyTrail, ShapeTrail("", Seq.empty), Seq.empty, _ => Unit)
        bodyJson.items.zipWithIndex.foreach{ case (item, index) => {
          val itemTrail = bodyTrail.withChild(JsonArrayItem(index))
          traverse(Some(item), itemTrail)
        }}
      } else if (bodyJson.isObject) {
        visitors.objectVisitor.visit(bodyJson, bodyTrail, ShapeTrail("", Seq.empty), Seq.empty, (_, __) => Unit)
        bodyJson.fields.foreach{ case (key, value) => {
          val fieldTrail = bodyTrail.withChild(JsonObjectKey(key))
          traverse(Some(value), fieldTrail)
        }}
      } else {
        visitors.primitiveVisitor.visit(bodyJson, bodyTrail, ShapeTrail("", Seq.empty), Seq.empty)
      }
    }
  }
}
