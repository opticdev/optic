package com.opticdev.sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.sdk.descriptions.Lens

class SdkLensSpec extends FunSpec {

  val validLensJson = """{
                          "name": "Using Require",
                          "schema": "js-import^1.0.0",
                          "snippet": {
                            "name": "Using Require",
                            "lang": "javascript",
                            "version": "es6",
                            "block": "let definedAs = require('pathTo')"
                          },
                          "rules": [],
                          "components": [
                            {
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
                            },
                            {
                              "type": "code",
                              "codeType": "token",
                              "finder": {
                                "type": "string",
                                "rule": "entire",
                                "string": "pathTo",
                                "occurrence": 0
                              },
                              "propertyPath": "pathTo",
                              "pathObject": {
                                "type": "string"
                              },
                              "options": {
                                "lookupTable": null,
                                "invariant": false,
                                "parser": null,
                                "mutator": null
                              }
                            }
                          ]
                        }"""

  val invalidLensJson = """{ "name": "hello world" }"""

  describe("parser") {

    it("works when valid") {
      Lens.fromJson(Json.parse(validLensJson))
    }

    it("fails when invalid") {
      Lens.fromJson(Json.parse(validLensJson))
    }

  }


}
