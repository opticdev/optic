package com.opticdev.core.sourcegear.graph
import com.opticdev.parsers.graph.BaseNode
import play.api.libs.json.JsObject
import com.opticdev.core.sdk.descriptions.SchemaId

case class ModelNode(schemaId: SchemaId, var value: JsObject) extends BaseNode {
  def silentUpdate(newVal: JsObject) = value = newVal
}
