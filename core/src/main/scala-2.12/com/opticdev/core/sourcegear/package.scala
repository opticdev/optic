package com.opticdev.core

import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.parsers.{AstGraph, ParserBase}
import play.api.libs.json.Json

package object sourcegear {

  val version = "0.1.0"

  case class FileParseResults(astGraph: AstGraph, modelNodes: Vector[ModelNode], parser: ParserBase, fileContents: String)

  import com.opticdev.common.rangeJsonFormats
  implicit val astDebugLocationFormats = Json.format[AstDebugLocation]
  case class AstDebugLocation(filePath: String, range: Range) {
    override def toString: String = s"${range.start}, ${range.end} in $filePath"
  }

}
