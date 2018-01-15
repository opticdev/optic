package com.opticdev.sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.sdk.descriptions.enums.LocationEnums._
import com.opticdev.sdk.descriptions.enums.NotSupported
import com.opticdev.sdk.descriptions.{CodeComponent, Component, SchemaComponent, Snippet}

class SdkComponentSpec extends FunSpec {

  describe("Code Type") {

    val validJson =
      """
        |{
        |				"type": "code",
        |				"finder": {
        |					"type": "stringFinder",
        |					"string": "pathTo",
        |					"rule": "containing",
        |					"occurrence": 0
        |				},
        |				"propertyPath": ["pathTo"]
        |			}
      """.stripMargin

    it("for valid json") {
      val component = Component.fromJson(Json.parse(validJson))
      assert(component.isInstanceOf[CodeComponent])
      assert(component.componentType == NotSupported)
    }
  }

  describe("Schema Type") {

    val validJson = """{
                    "type": "schema",
                    "schema": "optic:rest@1.0.0/route",
                    "propertyPath": ["parameters"],
                    "mapUnique": true,
                    "location": {
                      "type": "InParent",
                      "finder": null
                      }
                  }"""

    it("for valid json") {
      val component = Component.fromJson(Json.parse(validJson))
      assert(component.isInstanceOf[SchemaComponent])
      assert(component.asInstanceOf[SchemaComponent].location.in == InParent)
    }

  }

  it("throws on invalid json") {

    val invalidJson = """{
                    "type": "not-real",
                    "codeType": "wrong",
                    "finder": [],
                    "propertyPath": 43,
                    "options": { }
                    }"""


    assertThrows[Error] {
      Component.fromJson(Json.parse(invalidJson))
    }

  }
}
