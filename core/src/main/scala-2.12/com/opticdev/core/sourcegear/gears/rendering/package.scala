package com.opticdev.core.sourcegear.gears

import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.context.{FlatContextBase, FlatContextBuilder}
import com.opticdev.core.sourcegear.graph.model.{FlatModelNode, ModelNode}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.AstType
import com.opticdev.sdk.{ContainersContent, VariableMapping}
import play.api.libs.json.JsObject

import scala.util.Try

package object rendering {

  trait Renderer {
    def parser: ParserBase
    def outputType: AstType
    def render(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase = null): String
    def renderWithNewAstNode(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty): (NewAstNode, String)

    //for sync diffs
    def parseAndGetModel(contents: String)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty) : Try[JsObject]
    def parseAndGetModelWithGraph(contents: String)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty): Try[(JsObject, AstGraph, FlatModelNode)]
  }

}
