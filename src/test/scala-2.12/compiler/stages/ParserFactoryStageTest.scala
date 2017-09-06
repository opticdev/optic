package compiler.stages

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import play.api.libs.json.{JsObject, JsString}
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions._
import sdk.descriptions.enums.ComponentEnums._
import sdk.descriptions.enums.FinderEnums._
import sdk.descriptions.enums.LocationEnums
import sdk.descriptions.enums.RuleEnums._


class ParserFactoryStageTest extends TestBase with ParserUtils {

  describe("Parser factory stage") {

    it("Can build a valid description from snippet") {
      val block = "var hello = require('world')"

      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      assert(parseGear.description.toString == """NodeDesc(AstType(VariableDeclaration,Javascript),Child(0,null),Map(kind -> StringProperty(var)),Vector(NodeDesc(AstType(VariableDeclarator,Javascript),Child(0,declarations),Map(),Vector(NodeDesc(AstType(Identifier,Javascript),Child(0,id),Map(name -> StringProperty(hello)),Vector(),Vector()), NodeDesc(AstType(CallExpression,Javascript),Child(0,init),Map(),Vector(NodeDesc(AstType(Identifier,Javascript),Child(0,callee),Map(name -> StringProperty(require)),Vector(),Vector()), NodeDesc(AstType(Literal,Javascript),Child(0,arguments),Map(value -> StringProperty(world)),Vector(),Vector())),Vector())),Vector())),Vector())""")
    }

    describe("Has valid fields") {
      it("when none set") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

        val block = "var hello = require('world')"

        assert(parseGear.components.size == 0)
        assert(parseGear.rules.size == 0)
      }

      it("when a component is set") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          CodeComponent(Token, "definedAs", StringFinder(Entire, "hello"))
        ))

        assert(parseGear.components.size == 1)
        //implied from the component
        assert(parseGear.rules.size == 1)
      }

      it("when a component is set and a rule is set") {
        val customRules = Vector(PropertyRule(StringFinder(Starting, "var"), "kind", "ANY"))

        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
          //this causes any token rule to be applied
          CodeComponent(Token, "definedAs", StringFinder(Entire, "hello"))
        ), customRules)

        assert(parseGear.components.size == 1)
        //implied from the component
        assert(parseGear.rules.size == 2)
      }

      it("listens to file accumulators") {
        val schemaComponent = SchemaComponent("properties", SchemaId("example-parameter"), Location(LocationEnums.Anywhere))
        val parseGear = parseGearFromSnippetWithComponents("function hello() { }", Vector(
          schemaComponent
        ))

        assert(parseGear.listeners.size == 1)
        val listener = parseGear.listeners.head
        assert(listener.schema == schemaComponent.schema)
      }

    }


  }

}
