package sourcegear.gears.parsing


import com.opticdev.parsers.graph.AstPrimitiveNode
import play.api.libs.json.{JsObject, JsValue}
import sourcegear.graph.ModelNode

case class ParseResult(parseGear: ParseGear, modelNode: ModelNode, astNode: AstPrimitiveNode)

