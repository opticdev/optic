package com.opticdev.core.sourcegear

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.core.sourcegear.gears.parsing.ParseResult
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.common.graph.{AstGraph, CommonAstNode}

package object accumulate {

  trait Accumulator {

    val listeners : Map[SchemaRef, Set[Listener]]

    def run(implicit astGraph: AstGraph, parseResults: Vector[ParseResult[CommonAstNode]]) : Unit

  }

  trait Listener {
    def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext) : Option[ModelField]
    val schema: Option[SchemaRef]
    val mapToSchema: SchemaRef
  }

}
