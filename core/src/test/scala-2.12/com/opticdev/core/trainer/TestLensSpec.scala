package com.opticdev.core.trainer

import better.files.File
import com.opticdev.core.Fixture.TestBase
import play.api.libs.json.{JsObject, JsString, Json}

class TestLensSpec extends TestBase {

  describe("using other markdown") {
    it("can parse valid markdown file") {
      val desc = TestLens.descriptionFromString(File("test-examples/resources/example_markdown/Importing-JS.md").contentAsString)
      assert(desc.value("info").as[JsObject].value("package").as[JsString].value == "importingjs")
    }

    it("will provide a default description when invalid") {
      val desc = TestLens.descriptionFromString("not valid markdown <!-- {{Package {} --> ")
      assert(desc.value("info").as[JsObject].value("package").as[JsString].value == "optictest")
    }
  }

  it("can compile") {

    val importExample =
      Json.parse("""
                   |{
                   |      "name": "Using Require",
                   |      "id": "using-require",
                   |      "schema": {},
                   |      "snippet": {
                   |        "language": "es7",
                   |        "block": "let definedAs = require('pathTo')"
                   |      },
                   |      "value": {
                   |        "definedAs": {
                   |          "type": "token",
                   |          "at": {
                   |            "astType": "Identifier",
                   |            "range": {
                   |              "start": 4,
                   |              "end": 13
                   |            }
                   |          }
                   |        },
                   |        "pathTo": {
                   |          "type": "literal",
                   |          "at": {
                   |            "astType": "Literal",
                   |            "range": {
                   |              "start": 24,
                   |              "end": 32
                   |            }
                   |          }
                   |        }
                   |      }
                   |    }
                 """.stripMargin)

    val results = TestLens.testLens(importExample.as[JsObject], File("test-examples/resources/example_markdown/Importing-JS.md").contentAsString,  "let definedAs = require('pathTo')")
    assert(results.get == Json.parse("""{"definedAs":"definedAs","pathTo":"pathTo","_variables":{}}"""))
  }

}
