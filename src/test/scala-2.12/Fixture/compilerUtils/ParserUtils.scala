package Fixture.compilerUtils

import compiler_new.SnippetStageOutput
import compiler_new.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import sdk.descriptions.{Component, Lens, Rule, Snippet}
import sourcegear.gears.parsing.ParseGear

trait ParserUtils {

  def parseGearFromSnippetWithComponents(block: String, components: Vector[Component], rules: Vector[Rule] = Vector()) : ParseGear = {
    val snippet = Snippet("Testing", "Javascript", "es6", block)
    implicit val lens : Lens = Lens("Example", null, snippet, rules, components)

    val snippetBuilder = new SnippetStage(snippet)
    val snippetOutput = snippetBuilder.run
    val finderStage = new FinderStage(snippetOutput)
    val finderStageOutput = finderStage.run
    val parserFactoryStage = new ParserFactoryStage(finderStageOutput)
    val output = parserFactoryStage.run

    output.parseGear
  }

  def sample(block: String) : SnippetStageOutput = {
    val snippet = Snippet("Testing", "Javascript", "es6", block)
    implicit val lens : Lens = Lens("Example", null, snippet, Vector(), Vector())
    val snippetBuilder = new SnippetStage(snippet)
    snippetBuilder.run
  }


}
