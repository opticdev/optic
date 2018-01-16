package com.opticdev.core.Fixture.compilerUtils

import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.compiler.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import com.opticdev.sdk.descriptions.{Component, Lens, Rule, Snippet}
import com.opticdev.core.sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import com.opticdev.core._
import com.opticdev.core.sourcegear.variables.VariableManager
import com.opticdev.parsers.SourceParserManager

trait ParserUtils {

  def parseGearFromSnippetWithComponents(block: String, components: Vector[Component], rules: Vector[Rule] = Vector()) : ParseAsModel = {
    val snippet = Snippet("Javascript", Some("es6"), block)
    implicit val lens : Lens = Lens("Example", BlankSchema, snippet, rules, components, Vector(), Vector())
    implicit val variableManager = VariableManager(Vector(), SourceParserManager.installedParsers.head.identifierNodeDesc)

    val snippetBuilder = new SnippetStage(snippet)
    val snippetOutput = snippetBuilder.run
    val finderStage = new FinderStage(snippetOutput)
    val finderStageOutput = finderStage.run
    val parserFactoryStage = new ParserFactoryStage(snippetOutput, finderStageOutput)(lens)
    val output = parserFactoryStage.run

    output.parseGear.asInstanceOf[ParseAsModel]
  }

  def sample(block: String) : SnippetStageOutput = {
    val snippet = Snippet("Javascript", Some("es6"), block)
    implicit val lens : Lens = Lens("Example", BlankSchema, snippet, Vector(), Vector(), Vector(), Vector())
    val snippetBuilder = new SnippetStage(snippet)
    snippetBuilder.run
  }


}
