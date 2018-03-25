package com.opticdev.core.sourcegear.variables

import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions.{Variable, VariableRule}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString}

class VariableManagerSpec extends FunSpec {

  describe("Lookup Table") {

    def f = new {
      val testTable = VariableLookupTable(Vector(
        Variable("test", VariableEnums.Self),
        Variable("test1", VariableEnums.Self),
        Variable("test2", VariableEnums.Self)
      ), "name", AstType("Identifier", "es7"))
    }

    it("can lookup a variable by its id") {
      val fixture = f
      assert(f.testTable.lookupVariableValue("test").get == Variable("test", VariableEnums.Self))
    }

    it("will match a real variable with any value the first time") {
      val fixture = f
      assert(f.testTable.matchesVariableValue("test", "ANY_VALUE"))
    }

    it("will not match a variable that hasn't been defined") {
      val fixture = f
      assert(!f.testTable.matchesVariableValue("not_real", "ANY_VALUE"))
    }

    it("will match all consecutive instances with the first definition of each variable") {
      val fixture = f
      assert(fixture.testTable.matchesVariableValue("test", "ANY_VALUE"))
      assert(fixture.testTable.matchesVariableValue("test", "ANY_VALUE"))
      assert(!fixture.testTable.matchesVariableValue("test", "different"))
      assert(fixture.testTable.matchesVariableValue("test", "ANY_VALUE"))
    }

    it("can match from an AST Node") {
      val fixture = f

      val variableRule = VariableRule(null, "test")
      val first = CommonAstNode(AstType("Identifier", "es7"), Range(0, 5), JsObject(Seq("name" -> JsString("ANY_VALUE"))))
      val second = CommonAstNode(AstType("Identifier", "es7"), Range(10, 15), JsObject(Seq("name" -> JsString("ANY_VALUE"))))
      val different = CommonAstNode(AstType("Identifier", "es7"), Range(20, 25), JsObject(Seq("name" -> JsString("different"))))

      assert(fixture.testTable.astNodeMatchesVariable(variableRule, first))
      assert(fixture.testTable.astNodeMatchesVariable(variableRule, second))
      assert(!fixture.testTable.astNodeMatchesVariable(variableRule, different))
      assert(fixture.testTable.astNodeMatchesVariable(variableRule, second))

    }

  }

  describe("Variable Changes") {

    it("Returns Changes from variable mappings") {
      val v = Variable("variable", VariableEnums.Self)
      val testManager = VariableManager(Vector(v), null)

      val changes = testManager.changesFromMapping(Map("variable" -> "HELLO"))

      assert(changes.changes.size == 1)
      assert(changes.changes.head == SetVariable(v, "HELLO"))

    }

  }

}
