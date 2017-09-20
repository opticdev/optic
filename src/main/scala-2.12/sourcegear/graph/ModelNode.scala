package sourcegear.graph

import com.opticdev.parsers.graph.BaseNode
import play.api.libs.json.JsObject
import sdk.descriptions.SchemaId

case class ModelNode(schemaId: SchemaId, var value: JsObject) extends BaseNode {
  def silentUpdate(newVal: JsObject) = value = newVal
}
