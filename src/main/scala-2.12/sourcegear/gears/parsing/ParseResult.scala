package sourcegear.gears.parsing


import optic.parsers.GraphUtils.AstPrimitiveNode
import play.api.libs.json.{JsObject, JsValue}
import sourcegear.graph.ModelNode

case class ParseResult(parseGear: ParseGear, modelNode: ModelNode, astNode: AstPrimitiveNode)

