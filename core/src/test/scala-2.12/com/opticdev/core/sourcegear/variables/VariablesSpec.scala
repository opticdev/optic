package com.opticdev.core.sourcegear.variables

import com.opticdev.common.PackageRef
import com.opticdev.core.BlankSchema
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.opticmarkdown2.OMSnippet
import com.opticdev.sdk.opticmarkdown2.compilerInputs.variables.OMVariable
import com.opticdev.sdk.opticmarkdown2.lens.{OMLens, Self}
import play.api.libs.json.JsObject

class VariablesSpec extends TestBase with GearUtils with ParserUtils {


  val block = "function test () { \n let definedAs = require('pathTo') \n definedAs() \n definedAs + definedAs \n }"
  implicit val lens : OMLens = OMLens(Some("Example"), "example", OMSnippet("es7", block), Map(), Map(
    "definedAs" -> Self
  ), Map(), Left(BlankSchema), JsObject.empty, "es7", PackageRef("example:testing"))

  val snippetBuilder = new SnippetStage(lens.snippet)
  val snippetStageOutput = snippetBuilder.run

  it("can generate correct variable rules for parser") {
    val variableManager = VariableManager(lens.variablesCompilerInput, SourceParserManager.installedParsers.head.identifierNodeDesc)
    val variableRules = variableManager.rules(snippetStageOutput)

    assert(variableRules(0).isPropertyRule && variableRules(0).asInstanceOf[PropertyRule].comparator == "ANY")
    assert(variableRules(1).isVariableRule && variableRules(1).asInstanceOf[VariableRule].variableId == "definedAs")

    assert(variableRules(2).isVariableRule && variableRules(1).asInstanceOf[VariableRule].variableId == "definedAs")
    assert(variableRules(3).isVariableRule && variableRules(2).asInstanceOf[VariableRule].variableId == "definedAs")
    assert(variableRules(4).isVariableRule && variableRules(3).asInstanceOf[VariableRule].variableId == "definedAs")
  }

  lazy val gearWithVariables = compiledLensFromDescription("test-examples/resources/example_packages/optic:VariableExample@0.1.0.json")

  it("variable rules will get added to parser's ruleset") {
    val rules = gearWithVariables.parser.rules.flatMap(_._2)
    assert(rules.count(_.isVariableRule) == 4)
  }

  describe("Parsing") {

    def testBlock(fileContents: String) = {
      val parsed = sample(fileContents)
      val astGraph = parsed.astGraph
      val enterOn = parsed.entryChildren.head
      gearWithVariables.parser.matches(enterOn)(astGraph, fileContents, sourceGearContext, null)
    }

    it("parser will match exact duplicate of snippet") {
      val fileContents = "function test () { \n let definedAs = require('pathTo') \n definedAs() \n definedAs + definedAs \n }"
      assert(testBlock(fileContents).isDefined)
    }

    it("parser will match snippet when all variable instances are changed") {
      val fileContents = "function test () { \n let nowItsNew = require('pathTo') \n nowItsNew() \n nowItsNew + nowItsNew \n }"
      assert(testBlock(fileContents).isDefined)
    }

    it("parser will not match snippet when only some instance variables are correct") {
      val fileContents = "function test () { \n let nowItsNew = require('pathTo') \n nowItsNew() \n nowItsNew + wrong \n }"
      assert(testBlock(fileContents).isEmpty)
    }

    it("parser will not match snippet when only all instance variables are different") {
      val fileContents = "function test () { \n let firstWrong = require('pathTo') \n secondWrong() \n thridWrong + fourthWrong \n }"
      assert(testBlock(fileContents).isEmpty)
    }

    it("will save current variables in model node") {
      val fileContents = "function test () { \n let nowItsNew = require('pathTo') \n nowItsNew() \n nowItsNew + nowItsNew \n }"
      assert(testBlock(fileContents).get.modelNode.variableMapping == Map("definedAs" -> "nowItsNew"))
    }

  }

}
