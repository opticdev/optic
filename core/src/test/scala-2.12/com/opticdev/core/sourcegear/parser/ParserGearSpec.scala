package com.opticdev.core.sourcegear.parser

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.ParserUtils
import com.opticdev.sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.sdk.descriptions.enums.RuleEnums.Any
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.sdk.descriptions.{ChildrenRule, CodeComponent, PropertyRule}
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import play.api.libs.json.{JsObject, JsString}

class ParserGearSpec extends AkkaTestFixture("ParserGearTest") with ParserUtils {


  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val gearSet = new GearSet()
    override val schemas = Set()
  }

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)


  describe("Matching and extracting") {
    it("Can build a valid description from snippet") {
      val block = "var hello = require('world')"

      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      assert(parseGear.description.toString == """NodeDescription(AstType(VariableDeclaration,Javascript),Range 0 until 28,Child(0,null,false),Map(kind -> StringProperty(var)),Vector(NodeDescription(AstType(VariableDeclarator,Javascript),Range 4 until 28,Child(0,declarations,true),Map(),Vector(NodeDescription(AstType(Identifier,Javascript),Range 4 until 9,Child(0,id,false),Map(name -> StringProperty(hello)),Vector(),Vector()), NodeDescription(AstType(CallExpression,Javascript),Range 12 until 28,Child(0,init,false),Map(),Vector(NodeDescription(AstType(Literal,Javascript),Range 20 until 27,Child(0,arguments,true),Map(value -> StringProperty(world)),Vector(),Vector()), NodeDescription(AstType(Identifier,Javascript),Range 12 until 19,Child(0,callee,false),Map(name -> StringProperty(require)),Vector(),Vector())),Vector())),Vector())),Vector())""")
    }

    it("Can match its original snippet to the description") {
      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      val block = "var hello = require('world')"

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block, sourceGearContext, project)
      assert(result.isDefined)
    }

    it("fails to match a different snippet than the description") {
      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      val block = "var goodbye = notRequire('nation')"

      val parsedSample = sample(block)
      val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block, sourceGearContext, project)
      assert(!result.isDefined)

    }

    describe("with rules") {

      it("Matches any value for a token component/extracts value") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          CodeComponent(Token, "definedAs", StringFinder(Entire, "hello"))
        ))

        val block = "var otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        assert(result.get.modelNode.value == JsObject(Seq("definedAs" -> JsString("otherValue"))))
      }

      it("works for property rules") {

        val customRules = Vector(PropertyRule(StringFinder(Starting, "var"), "kind", "ANY"))

        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          CodeComponent(Token, "definedAs", StringFinder(Entire, "hello"))
        ), customRules)

        //different kind operator var -> let
        val block = "let otherValue = require('world')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)
        assert(result.get.modelNode.value == JsObject(Seq("definedAs" -> JsString("otherValue"))))

      }

      describe("for children") {

        it("Matches Any") {
          val customRules = Vector(ChildrenRule(StringFinder(Starting, "{"), Any))

          val parseGear = parseGearFromSnippetWithComponents("function hello () { }", Vector(), customRules)

          val block = "function hello () { return hello }"

          val parsedSample = sample(block)

          val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)

          assert(result.isDefined)

        }

        it("Will not match Any without rule") {

          val parseGear = parseGearFromSnippetWithComponents("function hello () { }", Vector())

          val block = "function hello () { return hello }"

          val parsedSample = sample(block)

          val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)

          assert(!result.isDefined)

        }

      }

    }

    describe("with extractors") {

      it("Extracts definedAs (token) and pathTo (literal) from an import") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          CodeComponent(Token, "definedAs", StringFinder(Entire, "hello")),
          CodeComponent(Literal, "pathTo", StringFinder(Containing, "world"))
        ))

        val block = "var otherValue = require('that-lib')"

        val parsedSample = sample(block)
        val result = parseGear.matches(parsedSample.entryChildren.head, true)(parsedSample.astGraph, block, sourceGearContext, project)
        assert(result.isDefined)

        val expected = JsObject(Seq("definedAs" -> JsString("otherValue"), "pathTo" -> JsString("that-lib")))
        assert(result.get.modelNode.value == expected)
      }
    }
}

}
