package com.opticdev.sdk

import org.scalatest.FunSpec
import play.api.libs.json.{JsError, Json}
import com.opticdev.sdk.descriptions.Lens

class SdkLensSpec extends FunSpec {

  val validLensJson =
    """
      |{
      |			"name": "import using require",
      |			"packageRef": "test:test@1.11.1",
      |			"schema": "js-import",
      |			"snippet": {
      |				"language": "javascript",
      |				"block": "const definedAs = require('pathTo')"
      |			},
      |			"scope": "public",
      |			"components": [{
      |				"type": "code",
      |				"finder": {
      |					"type": "stringFinder",
      |					"string": "pathTo",
      |					"rule": "containing",
      |					"occurrence": 0
      |				},
      |				"propertyPath": ["pathTo"]
      |			}, {
      |				"type": "code",
      |				"finder": {
      |					"type": "stringFinder",
      |					"string": "definedAs",
      |					"rule": "entire",
      |					"occurrence": 0
      |				},
      |				"propertyPath": ["definedAs"]
      |			}],
      |			"rules": [],
      |			"variables": [],
      |			"subcontainers": [{
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
      |					}]
      |		}
    """.stripMargin

  val invalidLensJson = """{ "name": "hello world" }"""

  describe("parser") {

    it("works when valid") {
      Lens.fromJson(Json.parse(validLensJson))
    }

    it("fails when invalid") {
      assertThrows[Error] {
        Lens.fromJson(Json.parse(invalidLensJson))
      }
    }

  }


}
