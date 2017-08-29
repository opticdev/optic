package sourcegear.gears.parsing

import cognitro.parsers.GraphUtils.FileNode
import play.api.libs.json.{JsObject, JsValue}

case class ParseResult(parseGear: ParseGear, model: JsObject, fileNode: FileNode, graphPath: String)

