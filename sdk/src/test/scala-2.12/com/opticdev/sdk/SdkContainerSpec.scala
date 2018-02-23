package com.opticdev.sdk

import com.opticdev.sdk.descriptions.enums.RuleEnums.SameAnyOrderPlus
import com.opticdev.sdk.descriptions.{Container, ContainerBase, SubContainer}
import org.scalatest.FunSpec
import play.api.libs.json.Json

class SdkContainerSpec extends FunSpec {

  describe("sub container") {

    val json =
      """
        |{
        |						"name": "container name",
        |						"subcontainer": true,
        |						"pulls": ["test:package/schema"],
        |						"childrenRule": "same-plus-any-order",
        |						"schemaComponents": [
        |             {
        |                    "type": "schema",
        |                    "schema": "optic:rest@1.0.0/route",
        |                    "propertyPath": ["parameters"],
        |                    "mapUnique": true,
        |                    "location": {
        |                      "type": "InParent",
        |                      "finder": null
        |                      }
        |                  }
        |             ]
        |					}
      """.stripMargin

    it("parses when valid") {
      val result = ContainerBase.fromJson(Json.parse(json)).asInstanceOf[SubContainer]
      assert(result.name == "container name")
      assert(result.pulls.size == 1)
      assert(result.schemaComponents.size == 1)
      assert(result.childrenRule == SameAnyOrderPlus)
    }

  }

  describe("root container") {

    val json =
      """
        |{ "snippet": {"language": "es7", "block": "function test () {}"},
        |					"subcontainer": false,
        |					"name": "Test",
        |					"pulls": ["test:package/schema"],
        |					"childrenRule": "same-plus-any-order",
        |					"schemaComponents": [
        |           {
        |                    "type": "schema",
        |                    "schema": "optic:rest@1.0.0/route",
        |                    "propertyPath": ["parameters"],
        |                    "mapUnique": true,
        |                    "location": {
        |                      "type": "InParent",
        |                      "finder": null
        |                      }
        |                  }
        |         ] }
      """.stripMargin

    it("parses when valid") {
      val result = ContainerBase.fromJson(Json.parse(json)).asInstanceOf[Container]
      assert(result.schemaComponents.size == 1)
      assert(result.pulls.size == 1)
      assert(result.name == "Test")
      assert(result.childrenRule == SameAnyOrderPlus)
    }

  }

}
