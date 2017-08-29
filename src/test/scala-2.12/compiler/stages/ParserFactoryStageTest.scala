package compiler.stages

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import compiler_new.SnippetStageOutput
import compiler_new.stages.{FinderStage, ParserFactoryStage, SnippetStage}
import play.api.libs.json.JsString
import sdk.descriptions.enums.ComponentEnums._
import sdk.descriptions.enums.FinderEnums._
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions._
import sdk.descriptions.enums.RuleEnums._
import sourcegear.gears.ParseGear


class ParserFactoryStageTest extends TestBase with ParserUtils {

  describe("Parser factory stage") {

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
          Component(Code, Token, "definedAs", StringFinder(Entire, "hello"))
        ))

        val block = "var otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block)
        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.head.value == JsString("otherValue"))
      }

      it("works for property rules") {

        val customRules = Vector(PropertyRule(StringFinder(Starting, "var"), "kind", "ANY"))

        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          Component(Code, Token, "definedAs", StringFinder(Entire, "hello"))
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
          val customRules = Vector(ChildrenRule(StringFinder(Starting, "{"), Any))

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
          Component(Code, Token, "definedAs", StringFinder(Entire, "hello")),
          Component(Code, Literal, "pathTo", StringFinder(Containing, "world"))
        ))

        val block = "var otherValue = require('that-lib')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block)
        assert(result.isMatch)
        assert(result.extracted.isDefined)
        assert(result.extracted.get.head.value == JsString("otherValue"))
        assert(result.extracted.get.last.value == JsString("that-lib"))
      }

    }


  }

}
