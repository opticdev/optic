package com.opticdev.core.compiler.stages

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.ParserUtils
import com.opticdev.parsers.SourceParserManager
import play.api.libs.json.{JsObject, JsString}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.ComponentEnums._
import com.opticdev.sdk.descriptions.enums.FinderEnums._
import com.opticdev.sdk.descriptions.enums.{LocationEnums, VariableEnums}
import com.opticdev.sdk.descriptions.enums.RuleEnums._
import com.opticdev.sdk.descriptions.finders.StringFinder


class ParserFactoryStageSpec extends TestBase with ParserUtils {

  it("Can build a valid description from snippet") {

    val block = "var hello = require('world')"

    val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

    assert(parseGear.description.toString == """NodeDescription(AstType(VariableDeclaration,es7),Range 0 until 28,Child(0,null,false),Map(kind -> StringProperty(var)),Vector(NodeDescription(AstType(VariableDeclarator,es7),Range 4 until 28,Child(0,declarations,true),Map(),Vector(NodeDescription(AstType(Identifier,es7),Range 4 until 9,Child(0,id,false),Map(name -> StringProperty(hello)),Vector(),Vector()), NodeDescription(AstType(CallExpression,es7),Range 12 until 28,Child(0,init,false),Map(),Vector(NodeDescription(AstType(Literal,es7),Range 20 until 27,Child(0,arguments,true),Map(value -> StringProperty(world)),Vector(),Vector()), NodeDescription(AstType(Identifier,es7),Range 12 until 19,Child(0,callee,false),Map(name -> StringProperty(require)),Vector(),Vector())),Vector())),Vector())),Vector())""")
  }

  describe("Has valid fields") {
    it("when none set") {
      val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      val block = "var hello = require('world')"

      assert(parseGear.components.size == 0)
      assert(parseGear.rules.size == 0)
    }

    it("when a component is set") {
      val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
        //this causes any token rule to be applied
        CodeComponent(Seq("definedAs"), StringFinder(Entire, "hello"))
      ))

      assert(parseGear.components.size == 1)
      //implied from the component
      assert(parseGear.rules.size == 1)
    }

    it("when a component is set and a rule is set") {
      val customRules = Vector(PropertyRule(StringFinder(Starting, "var"), "kind", "ANY"))

      val (parseGear, lens) = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
        //this causes any token rule to be applied
        CodeComponent(Seq("definedAs"), StringFinder(Entire, "hello"))
      ), customRules)

      assert(parseGear.components.size == 1)
      //implied from the component
      assert(parseGear.rules.size == 1)
    }

    it("listens to file accumulators") {
      val schemaComponent = SchemaComponent(Seq("properties"), SchemaRef(Some(PackageRef("test")), "example-parameter"), true, None, Some(Location(LocationEnums.Anywhere)))
      val (parseGear, lens) = parseGearFromSnippetWithComponents("function hello() { }", Vector(
        schemaComponent
      ))

      assert(parseGear.listeners.size == 1)
      val listener = parseGear.listeners.head
      assert(listener.schema == schemaComponent.schema)
    }

  }

}
