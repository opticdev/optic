package com.opticdev.core.sourcegear.gears.rendering

import com.opticdev.core.sourcegear.context.FlatContextBase
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.{ContainersContent, VariableMapping}
import play.api.libs.json.JsObject

class MultiNodeRenderGear(childLenses: Seq[CompiledLens]) {

  def renderWithNewAstNodes(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase): (Seq[NewAstNode], String) = {

    val renderedChildren = childLenses.map(i=> {
      i.renderer.renderWithNewAstNode(value, containersContent, variableMapping)
    })


    (renderedChildren.map(_._1), renderedChildren.map(_._2).mkString("\n\n"))
  }

  def render(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase): String =
    renderWithNewAstNodes(value, containersContent, variableMapping)._2

}
