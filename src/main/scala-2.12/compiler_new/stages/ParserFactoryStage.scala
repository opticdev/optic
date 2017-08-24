package compiler_new.stages

import cognitro.parsers.GraphUtils.Path.FlatWalkablePath
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode, Child}
import compiler_new.errors.AstPathNotFound
import compiler_new.{FinderStageOutput, ParserFactoryOutput}
import play.api.libs.json.JsObject
import sdk.descriptions.Finders.FinderPath
import sdk.descriptions.{Component, Lens, Rule}
import sourcegear.gears.{NodeDesc, ParseGear}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class ParserFactoryStage(finderStageOutput: FinderStageOutput)(implicit lens: Lens) extends CompilerStage[ParserFactoryOutput] {
  override def run: ParserFactoryOutput = {
    implicit val graph = finderStageOutput.snippetStageOutput.astGraph

    val enterOn = finderStageOutput.snippetStageOutput.entryChildren.head

    val nodeDescription = nodeToDescription(enterOn)

    ParserFactoryOutput(new ParseGear {
      override val description: NodeDesc = nodeDescription
      override val components: Map[FlatWalkablePath, Vector[Component]] = {
        finderStageOutput.componentFinders.map {
          case (finderPath, components)=> (finderPathToFlatPath(finderPath, enterOn), components)
        }
      }
      override val rules: Map[FlatWalkablePath, Vector[Rule]] = {
        finderStageOutput.ruleFinders.map {
          case (finderPath, rules)=> (finderPathToFlatPath(finderPath, enterOn), rules)
        }
      }
    })
  }

  def finderPathToFlatPath(finderPath: FinderPath, node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge]): FlatWalkablePath = {
    val path = finderPath.fromNode(node)
    if (path.isEmpty) throw AstPathNotFound(finderPath)
    path.get.toFlatPath
  }

  def nodeToDescription(astPrimitiveNode: AstPrimitiveNode, childType: String = null) : NodeDesc = {
    val children = astPrimitiveNode.getChildren(finderStageOutput.snippetStageOutput.astGraph)
      .map(i=> nodeToDescription(i._2, i._1.asInstanceOf[Child].typ))

    NodeDesc(
      astPrimitiveNode.nodeType,
      childType,
      astPrimitiveNode.properties.as[JsObject].value.toMap,
      children,
      Vector())
  }

}
