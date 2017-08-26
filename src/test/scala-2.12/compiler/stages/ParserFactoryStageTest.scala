package compiler.stages

import Fixture.TestBase
import compiler_new.SnippetStageOutput
import compiler_new.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import play.api.libs.json.JsString
import sdk.descriptions.Component.CodeTypes.{apply => _, _}
import sdk.descriptions.Component.Types._
import sdk.descriptions.Finders.Finder.StringFinderRules
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions._
import sourcegear.gears.ParseGear

class ParserFactoryStageTest extends TestBase {

  describe("Parser factory stage") {

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

    it("Can build a valid description from snippet") {
      val block = "var hello = require('world')"

      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())
      assert(parseGear.description.toString == """NodeDesc(AstType(VariableDeclaration,Javascript),Child(0,null),Map(kind -> "var"),Vector(NodeDesc(AstType(VariableDeclarator,Javascript),Child(0,declarations),Map(),Vector(NodeDesc(AstType(Identifier,Javascript),Child(0,id),Map(name -> "hello"),Vector(),Vector()), NodeDesc(AstType(CallExpression,Javascript),Child(0,init),Map(),Vector(NodeDesc(AstType(Identifier,Javascript),Child(0,callee),Map(name -> "require"),Vector(),Vector()), NodeDesc(AstType(Literal,Javascript),Child(0,arguments),Map(value -> "world"),Vector(),Vector())),Vector())),Vector())),Vector())""")
    }

    it("Can match its original snippet to the description") {
      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      val block = "var hello = require('world')"

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block)
      assert(result.isMatch)
    }

    it("fails to match a different snippet than the description") {
      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      val block = "var goodbye = notRequire('nation')"

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block)
      assert(!result.isMatch)

    }

    describe("with rules") {

      it("Matches any value for a token component/extracts value") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          Component(Code, Token, "definedAs", StringFinder(StringFinderRules.Entire, "hello"))
        ))

        val block = "var otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block)
        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.head.value == JsString("otherValue"))
      }

      it("works for property rules") {

        val customRules = Vector(PropertyRule(StringFinder(StringFinderRules.Starting, "var"), "kind", "ANY"))

        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          Component(Code, Token, "definedAs", StringFinder(StringFinderRules.Entire, "hello"))
        ), customRules)

        //different kind operator var -> let
        val block = "let otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block)
        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.head.value == JsString("otherValue"))

      }

      describe("for children") {

        it("Matches Any") {
          val customRules = Vector(ChildrenRule(StringFinder(StringFinderRules.Starting, "{"), ChildrenRuleType.Any))

          val parseGear = parseGearFromSnippetWithComponents("function hello () { }", Vector(), customRules)

          val block = "function hello () { return hello }"

          val parsedSample = sample(block)

          val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block)

          println(result)

        }

      }

    }

    describe("with extractors") {

      it("Extracts definedAs (token) and pathTo (literal) from an import") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          Component(Code, Token, "definedAs", StringFinder(StringFinderRules.Entire, "hello")),
          Component(Code, Literal, "pathTo", StringFinder(StringFinderRules.Containing, "world"))
        ))

        val block = "var otherValue = require('that-lib')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block)
        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.head.value == JsString("otherValue"))
        assert(result.extracted.get.last.value == JsString("that-lib"))
      }

//      it("Can extra a mapped X onto an array")

    }


  }

}
