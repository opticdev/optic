package com.opticdev.sdk

import com.opticdev.sdk.descriptions.enums.VariableEnums.{Scope, Self}
import com.opticdev.sdk.descriptions.{CodeComponent, Component, Variable}
import org.scalatest.FunSpec
import play.api.libs.json.Json

class SdkVariableSpec extends FunSpec {

    it("for self variables") {

      val validJson =
        """
          |{
          |				"token": "app",
          |				"in": "self"
          |			}
        """.stripMargin

      val variable = Variable.fromJson(Json.parse(validJson))
      assert(variable.isInstanceOf[Variable])
      assert(variable.token == "app")
      assert(variable.in == Self)
    }

    it("with scope variables") {

      val validJson =
        """
          |{
          |				"token": "app",
          |				"in": "scope"
          |			}
        """.stripMargin

      val variable = Variable.fromJson(Json.parse(validJson))
      assert(variable.isInstanceOf[Variable])
      assert(variable.token == "app")
      assert(variable.in == Scope)
    }

    it("throws for invalid objects") {
      val validJsonInvalidObject =
        """
          |{
          |				"tokenn": "app",
          |				"in": "THAT"
          |			}
        """.stripMargin

      assertThrows[Exception] {
        Variable.fromJson(Json.parse(validJsonInvalidObject))
      }
    }


}
