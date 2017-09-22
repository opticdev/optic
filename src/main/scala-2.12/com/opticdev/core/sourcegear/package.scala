package com.opticdev.core

import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.ModelNode

package object sourcegear {
  case class FileParseResults(astGraph: AstGraph, modelNodes: Set[BaseModelNode])
}
