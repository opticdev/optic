package compiler_new.stages

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, Child}
import compiler_new.{FinderStageOutput, ParserFactoryOutput}
import play.api.libs.json.JsObject
import sourcegear.gears.{NodeDesc, ParseGear}

class ParserFactoryStage(finderStageOutput: FinderStageOutput) extends CompilerStage[ParserFactoryOutput] {
  override def run: ParserFactoryOutput = {
    val nodeDescription = nodeToDescription(finderStageOutput.snippetStageOutput.rootNode)

    ParserFactoryOutput(new ParseGear {
      override val description: NodeDesc = nodeDescription
    })
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
