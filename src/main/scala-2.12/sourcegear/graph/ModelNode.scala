package sourcegear.graph

import cognitro.parsers.GraphUtils.BaseNode
import play.api.libs.json.JsObject
import sdk.descriptions.SchemaId

case class ModelNode(schemaId: SchemaId, var value: JsObject) extends BaseNode {
  def silentUpdate(newVal: JsObject) = value = newVal
}
