package com.opticdev.core.sourcegear.gears.rendering

import com.opticdev.core.sourcegear.context.{FlatContextBase, FlatContextBuilder}
import com.opticdev.core.sourcegear.graph.GraphImplicits
import com.opticdev.core.sourcegear.graph.model.{ExpandedModelNode, FlatModelNode, ModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.{CompiledLens, SGContext, SourceGear}
import com.opticdev.marvin.common.ast.NewAstNode
import com.opticdev.parsers.{AstGraph, ParserBase, ParserResult}
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.{ContainersContent, VariableMapping}
import play.api.libs.json.JsObject

import scala.util.Try

case class MultiNodeRenderGear(childLenses: Seq[CompiledLens], parser: ParserBase) extends Renderer {

  def renderWithNewAstNodes(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase): (Seq[NewAstNode], String) = {

    val renderedChildren = childLenses.map(i=> {
      i.renderer.renderWithNewAstNode(value, containersContent, variableMapping)
    })


    (renderedChildren.map(_._1), renderedChildren.map(_._2).mkString("\n\n"))
  }

  def renderWithNewAstNode(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty): (NewAstNode, String) = {
    val (nodes, string) = renderWithNewAstNodes(value, containersContent, variableMapping)
    (NewAstNode(nodes.head.nodeType, Map(), Some(string)), string)
  }

  def render(value: JsObject, containersContent: ContainersContent = Map.empty, variableMapping: VariableMapping = Map.empty)(implicit sourceGear: SourceGear, context: FlatContextBase): String =
    renderWithNewAstNodes(value, containersContent, variableMapping)._2

  override def outputType: AstType = AstType("Wrapper", parser.languageName)

  //used for staging sync diffs
  def parseResult(b: String): ParserResult = {
    parser.parseStringWithProxies(b).get
  }

  def parseAndGetRoot(contents: String): (String, AstGraph, CommonAstNode) = {
    implicit val fileContents = contents
    val test = parser.parseString(contents)
    implicit val astGraph = parseResult(contents).graph
    import GraphImplicits._
    val rootNode = astGraph.root.get
    (fileContents, astGraph, rootNode)
  }

  def parseAndGetModel(contents: String)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty) : Try[JsObject] = {
    parseAndGetModelWithGraph(contents).map(_._1)
  }

  def parseAndGetModelWithGraph(contents: String)(implicit sourceGear: SourceGear, context: FlatContextBase = FlatContextBuilder.empty): Try[(JsObject, AstGraph, FlatModelNode)] = Try {
    implicit val (fileContents, astGraph, rootNode) = parseAndGetRoot(contents)
    implicit val sourceGearContext = SGContext.forRender(sourceGear, astGraph, parser.parserRef)
    val results = sourceGear.lensSet.parseFromGraph(fileContents, astGraph, sourceGearContext, null, None)
    val model: MultiModelNode = results.modelNodes
      .collect{case mmn: MultiModelNode => mmn}
      .minBy(_.dependencies(astGraph).head.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](astGraph).root.graphDepth(astGraph))

    (model.expandedValue()(SGContext.forRender(sourceGear, results.astGraph, parser.parserRef)), results.astGraph, model)
  }

}
