package sourcegear.graph

import cognitro.parsers.GraphUtils.BaseNode
import play.api.libs.json.JsObject
import sdk.descriptions.SchemaId

case class ModelNode(schemaId: SchemaId, value: JsObject) extends BaseNode
