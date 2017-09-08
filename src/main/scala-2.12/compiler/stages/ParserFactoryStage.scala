package compiler.stages

import compiler.errors.AstPathNotFound
import compiler.{FinderStageOutput, ParserFactoryOutput, SnippetStageOutput}
import optic.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import optic.parsers.graph.Child
import optic.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.JsObject
import sdk.descriptions.Finders.FinderPath
import sdk.descriptions.{Component, Lens, Rule, Schema}
import sourcegear.gears.parsing.{NodeDesc, ParseAsModel, ParseGear}
import sourcegear.gears.RuleProvider

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import sdk.descriptions.helpers.ComponentImplicits._
import sourcegear.accumulate.MapSchemaListener
import optic.parsers.types.GraphTypes.AstGraph


class ParserFactoryStage(snippetStageOutput: SnippetStageOutput, finderStageOutput: FinderStageOutput)(implicit lens: Lens) extends CompilerStage[ParserFactoryOutput] {
  override def run: ParserFactoryOutput = {
    implicit val graph = snippetStageOutput.astGraph

    val enterOn = snippetStageOutput.entryChildren.head

    val nodeDescription = nodeToDescription(enterOn)

    val listeners = lens.components.schemaComponents.map(MapSchemaListener(_, lens.schema))

    implicit val ruleProvider = new RuleProvider()

    ParserFactoryOutput(
      ParseAsModel(
      nodeDescription,
      lens.schema,
      finderStageOutput.componentFinders.map {
        case (finderPath, components)=> (finderPathToFlatPath(finderPath, enterOn), components)
      },
      finderStageOutput.ruleFinders.map {
        case (finderPath, rules)=> (finderPathToFlatPath(finderPath, enterOn), rules)
      },
      listeners
    ))
  }

  def finderPathToFlatPath(finderPath: FinderPath, node: AstPrimitiveNode)(implicit graph: AstGraph): FlatWalkablePath = {
    val path = finderPath.fromNode(node)
    if (path.isEmpty) throw AstPathNotFound(finderPath)
    path.get.toFlatPath
  }

  def nodeToDescription(astPrimitiveNode: AstPrimitiveNode, edge: Child = Child(0, null)) : NodeDesc = {
    val children = astPrimitiveNode.children(snippetStageOutput.astGraph)
      .map(i=> nodeToDescription(i._2, i._1.asInstanceOf[Child]))

    import sdk.PropertyValuesConversions._

    NodeDesc(
      astPrimitiveNode.nodeType,
      edge,
      astPrimitiveNode.properties.as[JsObject].toScala.value,
      children,
      Vector())
  }

}
