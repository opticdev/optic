package com.opticdev.core

import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.parsers.AstGraph

package object sourcegear {
  case class FileParseResults(astGraph: AstGraph, modelNodes: Set[ModelNode])
}
