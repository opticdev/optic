package compiler.stages

import Fixture.TestBase
import compiler.errors.{ParserNotFound, SyntaxError, UnexpectedSnippetFormat}
import compiler.stages.{MatchType, SnippetStage}
import optic.parsers.GraphUtils.AstType
import org.scalatest.{FunSpec, PrivateMethodTester}
import sdk.descriptions.{Lens, Snippet}
import sourceparsers.SourceParserManager

import scala.util.Try

class SnippetStageTest extends TestBase with PrivateMethodTester {


  implicit val lens : Lens = Lens("Example", null, null, null, null)

  describe("Snippet Stage") {

    describe("constructor") {
      it("accepts a valid snippet") {
        new SnippetStage(Snippet("Testing", "Javascript", "es6", "function add (a, b) { a+b }"))
      }
    }

    describe("Finds the correct parser") {
      it("when it exists") {
        val snippetBuilder = new SnippetStage(Snippet("Testing", "Javascript", "es6", "function add (a, b) { a+b }"))
        assert(snippetBuilder.getParser().languageName == "Javascript")
      }

      it("fails when it does not") {
        val snippetBuilder = new SnippetStage(Snippet("Testing", "MadeUp", "0.0.1", "YO"))
        assertThrows[ParserNotFound] {
          snippetBuilder.getParser()
        }
      }
    }

    describe("parses snippet") {
      it("if it is valid") {
        val snippetBuilder = new SnippetStage(Snippet("Testing", "Javascript", "es6", "function add (a, b) { a+b }"))
        snippetBuilder.buildAstTree()
      }

      it("fails on snippet errors") {
        assertThrows[SyntaxError] {
          val snippetBuilder = new SnippetStage(Snippet("Testing", "Javascript", "es6", "function whoops { a+b }"))
          snippetBuilder.buildAstTree()
        }
      }

    }

    describe("calculates valid enterOn and MatchType") {

      def parseResult(codeBlock: String) = {
        val snippetBuilder = new SnippetStage(Snippet("Testing", "Javascript", "es6", codeBlock))

        val parser = snippetBuilder.getParser()
        val (ast, root) = snippetBuilder.buildAstTree()

        snippetBuilder.enterOnAndMatchType(ast, root, parser)
      }

      it("for single node snippets") {
        val (enterOn, children, matchType) = parseResult("function add(a, b) { return a+b }")
        assert(enterOn.size == 1 && enterOn.head == AstType("FunctionDeclaration", "Javascript"))
        assert(children.size == 1)
        assert(matchType == MatchType.Parent)
      }

      it("for multi-node snippets") {
        val (enterOn, children, matchType) = parseResult("function subtract(a,b) { return a-b } function add(a,b) { return a+b }")
        val blockNodeTypes = SourceParserManager.parserByLanguageName("Javascript").get.blockNodeTypes
        assert(enterOn.size == 2 && enterOn == blockNodeTypes)
        assert(children.size == 2)
        assert(matchType == MatchType.Children)
      }

      it("throws on an empty snippet") {
        assertThrows[UnexpectedSnippetFormat] {
          parseResult("//just a comment")
        }
      }

    }

  }

  describe("works end to end") {
    val snippetBuilder = new SnippetStage(Snippet("Testing", "Javascript", "es6", "function add (a, b) { a+b }"))
    val outputTry = Try(snippetBuilder.run)
    assert(outputTry.isSuccess)
  }


}
