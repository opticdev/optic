package com.opticdev.core

import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.parsers.{AstGraph, ParserBase}

package object sourcegear {
  case class FileParseResults(astGraph: AstGraph, modelNodes: Set[ModelNode], parser: ParserBase, fileContents: String)
}
