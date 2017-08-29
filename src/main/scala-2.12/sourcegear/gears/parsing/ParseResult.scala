package sourcegear.gears.parsing

import cognitro.parsers.GraphUtils.FileNode
import play.api.libs.json.JsValue

case class ParseResult(parseGear: ParseGear, model: Option[JsValue], fileNode: FileNode, graphPath: String)

