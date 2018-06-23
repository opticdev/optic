package com.opticdev.core.compiler.stages

import com.opticdev.core.compiler.errors.AstPathNotFound
import com.opticdev.core.compiler.helpers.FinderPath
import com.opticdev.core.compiler.{FinderStageOutput, ParserFactoryOutput, SnippetStageOutput}
import com.opticdev.core.sourcegear.accumulate.MapSchemaListener
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.parsing.{AdditionalParserInformation, NodeDescription, ParseAsModel}
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{Child, CommonAstNode}
import com.opticdev.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.JsObject
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.sdk.opticmarkdown2.lens.OMLens


class ParserFactoryStage(snippetStage: SnippetStageOutput, finderStageOutput: FinderStageOutput, internal: Boolean = false)(implicit lens: OMLens, variableManager: VariableManager = VariableManager.empty, subcontainersManager: SubContainerManager = SubContainerManager.empty) extends CompilerStage[ParserFactoryOutput] {
  implicit val snippetStageOutput = snippetStage
  override def run: ParserFactoryOutput = {

    import com.opticdev.sdk.descriptions.helpers.ComponentImplicits._

    implicit val graph = snippetStageOutput.astGraph

    val enterOn = snippetStageOutput.entryChildren.head

    val nodeDescription = ParserFactoryStage.nodeToDescription(enterOn)

    val listeners = lens.valueSchemaComponentsCompilerInput.map(watchForSchema => {
      MapSchemaListener(
        watchForSchema,
        lens.schemaRef,
        lens.packageRef.packageId
      )
    })

    ParserFactoryOutput(
      ParseAsModel(
      nodeDescription,
      lens.schemaRef,
      finderStageOutput.componentFinders.map {
        case (finderPath, components)=> (finderPathToFlatPath(finderPath, enterOn), components)
      },
      subcontainersManager.containerPaths,
      finderStageOutput.ruleFinders.map {
        case (finderPath, rules)=> (finderPathToFlatPath(finderPath, enterOn), rules)
      },
      listeners,
      variableManager,
      AdditionalParserInformation(snippetStage.parser.identifierNodeDesc, snippetStage.parser.blockNodeTypes.nodeTypes.toSeq),
      lens.packageRef.packageId,
      lens.lensRef,
      lens.initialValue,
      internal
    ))
  }

  def finderPathToFlatPath(finderPath: FinderPath, node: CommonAstNode)(implicit graph: AstGraph): FlatWalkablePath = {
    val path = finderPath.fromNode(node)
    if (path.isEmpty) throw AstPathNotFound(finderPath)
    path.get.toFlatPath
  }

}

object ParserFactoryStage {
  def nodeToDescription(CommonAstNode: CommonAstNode, edge: Child = Child(0, null)) (implicit snippetStageOutput: SnippetStageOutput) : NodeDescription = {
    val children = CommonAstNode.children(snippetStageOutput.astGraph)
      .map(i=> nodeToDescription(i._2, i._1.asInstanceOf[Child]))

    import com.opticdev.sdk.PropertyValuesConversions._

    NodeDescription(
      CommonAstNode.nodeType,
      CommonAstNode.range,
      edge,
      CommonAstNode.properties.as[JsObject].toScala.value,
      children,
      Vector())
  }
}
