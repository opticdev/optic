package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sdk.descriptions.SchemaId
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.BaseNode
import play.api.libs.json.JsObject


sealed trait BaseModelNode extends BaseNode {
  val schemaId : SchemaId
  var value : JsObject
}

case class ModelNode(schemaId: SchemaId, var value: JsObject) extends BaseModelNode {
  def silentUpdate(newVal: JsObject) = value = newVal
  def resolve(implicit astGraph: AstGraph) : LinkedModelNode = null
}

case class LinkedModelNode(schemaId: SchemaId, var value: JsObject, mapping: ModelAstMapping) {
  def flatten = ModelNode(schemaId, value)
}
