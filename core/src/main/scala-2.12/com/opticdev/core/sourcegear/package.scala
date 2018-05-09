package com.opticdev.core

import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.parsers.{AstGraph, ParserBase}
import play.api.libs.json.Json

package object sourcegear {

  val version = "0.1.0"

  case class FileParseResults(astGraph: AstGraph, modelNodes: Vector[ModelNode], parser: ParserBase, fileContents: String)

  case class AstDebugLocation(filePath: String, range: Range)(implicit project: ProjectBase) {
    override def toString: String = s"${range.start}, ${range.end} in ${project.trimAbsoluteFilePath(filePath)}"
  }

}
