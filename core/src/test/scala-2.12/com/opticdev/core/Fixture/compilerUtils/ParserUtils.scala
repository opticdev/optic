package com.opticdev.core.Fixture.compilerUtils

import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.compiler.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import com.opticdev.sdk.descriptions._
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core._
import com.opticdev.core.sourcegear.containers.SubContainerManager
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.SourceParserManager

trait ParserUtils {

  def parseGearFromSnippetWithComponents(block: String, components: Vector[Component], rules: Vector[Rule] = Vector(), subContainers: Vector[SubContainer] = Vector(), variables: Vector[Variable] = Vector()) : (ParseAsModel, Lens) = {
    val snippet = Snippet("es7", block)
    implicit val lens : Lens = Lens("Example", BlankSchema, snippet, components, variables, subContainers)
    implicit val variableManager = VariableManager(variables, SourceParserManager.installedParsers.head.identifierNodeDesc)

    val snippetBuilder = new SnippetStage(snippet)
    val snippetOutput = snippetBuilder.run

    implicit val subcontainersManager = new SubContainerManager(lens.subcontainers, snippetOutput.containerMapping)

    val finderStage = new FinderStage(snippetOutput)
    val finderStageOutput = finderStage.run
    val parserFactoryStage = new ParserFactoryStage(snippetOutput, finderStageOutput)(lens, variableManager, subcontainersManager)
    val output = parserFactoryStage.run

    (output.parseGear.asInstanceOf[ParseAsModel], lens)
  }

  def sample(block: String) : SnippetStageOutput = {
    val snippet = Snippet("es7", block)
    implicit val lens : Lens = Lens("Example", BlankSchema, snippet, Vector(), Vector(), Vector())
    val snippetBuilder = new SnippetStage(snippet)
    snippetBuilder.run
  }


}
