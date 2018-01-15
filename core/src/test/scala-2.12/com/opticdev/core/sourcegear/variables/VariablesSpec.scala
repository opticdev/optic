package com.opticdev.core.sourcegear.variables

import com.opticdev.core.BlankSchema
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions._

class VariablesSpec extends TestBase with GearUtils {


  val block = "function test () { \n let definedAs = require('pathTo') \n definedAs() \n definedAs + definedAs \n }"
  implicit val lens : Lens = Lens("Example", BlankSchema, Snippet("Javascript", Some("es6"), block), Vector(), Vector(), Vector(
    Variable("definedAs", VariableEnums.Self)
  ))

  val snippetBuilder = new SnippetStage(lens.snippet)
  val snippetStageOutput = snippetBuilder.run

  it("can generate correct variable rules for parser") {
    val variableManager = new VariableManager(lens.variables, SourceParserManager.installedParsers.head)
    val variableRules = variableManager.rules(snippetStageOutput)

    assert(variableRules(0).isPropertyRule && variableRules(0).asInstanceOf[PropertyRule].comparator == "ANY")
    assert(variableRules(1).isVariableRule && variableRules(1).asInstanceOf[VariableRule].variableId == "definedAs")

    assert(variableRules(2).isVariableRule && variableRules(1).asInstanceOf[VariableRule].variableId == "definedAs")
    assert(variableRules(3).isVariableRule && variableRules(2).asInstanceOf[VariableRule].variableId == "definedAs")
    assert(variableRules(4).isVariableRule && variableRules(3).asInstanceOf[VariableRule].variableId == "definedAs")

  }

  it("variable rules will get added to parser's ruleset") {
    val gearWithVariables = gearFromDescription("test-examples/resources/example_packages/optic:VariableExample@0.1.0.json")
    val rules = gearWithVariables.parser.rules.flatMap(_._2)
    assert(rules.count(_.isVariableRule) == 4)
  }

}
