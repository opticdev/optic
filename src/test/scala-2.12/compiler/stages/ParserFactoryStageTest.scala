package compiler.stages

import Fixture.TestBase
import compiler_new.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import org.scalatest.FunSpec
import sdk.descriptions.Component.CodeTypes.{apply => _, _}
import sdk.descriptions.Component.Types._
import sdk.descriptions.Finders.Finder.StringRules
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions.{Component, Lens, Snippet}

import scala.util.Try

class ParserFactoryStageTest extends TestBase {

  describe("Parser factory stage") {

    val snippetBlock = "var hello = require('world')"
    val snippet = Snippet("Testing", "Javascript", "es6", snippetBlock)

    implicit val lens : Lens = Lens("Example", null, snippet, Vector(
      Component(Code, Token, "definedAs", StringFinder(StringRules.Entire, "hello"))
    ))
    val snippetBuilder = new SnippetStage(snippet)
    val outputTry = Try(snippetBuilder.run)

    val finderStage = new FinderStage(outputTry.get)

    val finderStageOutput = finderStage.run

    it("Can build a valid description from snippet") {
      val parserFactoryStage = new ParserFactoryStage(finderStageOutput)
      val output = parserFactoryStage.run

      assert(output.parseGear.description.toString == """NodeDesc(AstType(Program,Javascript),null,Map(sourceType -> "script"),Vector(NodeDesc(AstType(VariableDeclaration,Javascript),body,Map(kind -> "var"),Vector(NodeDesc(AstType(VariableDeclarator,Javascript),declarations,Map(),Vector(NodeDesc(AstType(Identifier,Javascript),id,Map(name -> "hello"),Vector(),Vector()), NodeDesc(AstType(CallExpression,Javascript),init,Map(),Vector(NodeDesc(AstType(Identifier,Javascript),callee,Map(name -> "require"),Vector(),Vector()), NodeDesc(AstType(Literal,Javascript),arguments,Map(value -> "world"),Vector(),Vector())),Vector())),Vector())),Vector())),Vector())""")
    }

    it("Can match its original snippet to the description") {
      val parserFactoryStage = new ParserFactoryStage(finderStageOutput)
      val output = parserFactoryStage.run

      val parseGear = output.parseGear

      val snippet = outputTry.get

      val result = parseGear.matches(snippet.rootNode)(snippet.astGraph)

      assert(result.isMatch)

    }

    it("fails to match a different snippet than the description") {
      val parserFactoryStage = new ParserFactoryStage(finderStageOutput)
      val output = parserFactoryStage.run

      val parseGear = output.parseGear

      val snippetBlock = "var goodbye = notRequire('fakeWorld')"
      val snippet = Snippet("Testing", "Javascript", "es6", snippetBlock)
      val snippetBuilder = new SnippetStage(snippet)

      val snippetResult = snippetBuilder.run

      val result = parseGear.matches(snippetResult.rootNode)(snippetResult.astGraph)

      assert(!result.isMatch)

    }


  }

}
