package com.opticdev.core.sourcegear

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.core.sourcegear.gears.parsing.ParseResult
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.sdk.skills_sdk.LensRef

import scala.util.Try

package object accumulate {

  trait Accumulator {

    val listeners : Map[LensRef, Set[Listener]]

    def run(implicit astGraph: AstGraph, parseResults: Vector[ParseResult[CommonAstNode]]) : Unit

  }

  trait Listener {
    def collect(implicit astGraph: AstGraph, modelNode: BaseModelNode, sourceGearContext: SGContext) : Try[ModelField]
    val schema: Option[SchemaRef]
    val mapToSchema: SchemaRef
    def lensRef: LensRef
  }

}
