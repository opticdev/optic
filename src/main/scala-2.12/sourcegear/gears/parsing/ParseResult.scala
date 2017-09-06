package sourcegear.gears.parsing

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, FileNode}
import play.api.libs.json.{JsObject, JsValue}
import sourcegear.graph.ModelNode

case class ParseResult(parseGear: ParseGear, modelNode: ModelNode, astNode: AstPrimitiveNode)

