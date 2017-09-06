package sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json
import sdk.descriptions.enums.LocationEnums._
import sdk.descriptions.{CodeComponent, Component, SchemaComponent, Snippet}

class SdkComponentTest extends FunSpec {


  describe("Sdk Component") {

    describe("Code Type") {

      val validJson = """{
                      "type": "code",
                      "codeType": "token",
                      "finder": {
                        "type": "string",
                        "rule": "entire",
                        "string": "definedAs",
                        "occurrence": 0
                      },
                      "propertyPath": "definedAs",
                      "pathObject": {
                        "type": "string"
                      },
                      "options": {
                        "lookupTable": null,
                        "invariant": false,
                        "parser": null,
                        "mutator": null
                      }
                      }"""

      it("for valid json") {
        val component = Component.fromJson(Json.parse(validJson))
        assert(component.isInstanceOf[CodeComponent])
      }
    }

    describe("Schema Type") {

      val validJson = """{
                      "type": "schema",
                      "schema": "js-example-route-parameter^1.0.0",
                      "propertyPath": "parameters",
                      "pathObject": {
                      "type": "array",
                      "items": {
                      "$ref": "#/definitions/parameter"
                      }
                    },
                    "location": {
                      "type": "InParent",
                      "finder": null
                      },
                    "options": {
                      "lookupTable": null,
                      "invariant": false,
                      "parser": null,
                      "mutator": null
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

}
