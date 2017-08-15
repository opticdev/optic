package sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json
import sdk.descriptions.{Component, Snippet}

class SdkComponentTest extends FunSpec {


  val validJson = """{
                      "type": "code",
                      "codeType": "token",
                      "finder": {
                        "asJson": {
                        "type": "string",
                        "rule": "entire",
                        "string": "definedAs",
                        "occurrence": 0
                      }
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

  describe("Sdk Component") {

    describe("Parsing") {
      it("for valid json") {
        Component.fromJson(Json.parse(validJson))
      }
      it("for invalid json") {
        assertThrows[Error] {
//          Component.fromJson(Json.parse(invalidSnippetMissingFields))
        }

        assertThrows[Error] {
//          Component.fromJson(Json.parse(invalidSnippetTypeIssues))
        }
      }
    }

  }

}
