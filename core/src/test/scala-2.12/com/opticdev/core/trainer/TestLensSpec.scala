package com.opticdev.core.trainer

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.opm.packages.OpticMDPackage
import play.api.libs.json.{JsObject, JsString, Json}

class TestLensSpec extends TestBase {

  val importExample = Json.parse(File(
    "test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").contentAsString).as[JsObject]

  describe("parsing") {
    it("works when valid input and sourcegear") {
      val results = TestLens.testLensParse(importExample, "using-require", "let definedAs = require('pathTo')", "es7")
      assert(results.get == Json.parse("""{"definedAs":"definedAs","pathTo":"pathTo","_variables":{}}"""))
    }

    it("fails when invalid input") {
      val results = TestLens.testLensParse(importExample, "using-require", "let BAD CODE thTo')", "es7")
      assert(results.isFailure)
    }

    it("fails when no match is found") {
      val results = TestLens.testLensParse(importExample, "using-require", "let BAD CODE thTo')", "es7")
      assert(results.isFailure)
    }
  }

  describe("generation") {
    it("works with valid input") {
      val results = TestLens.testLensGenerate(importExample, "using-require",
        Json.parse("""{"definedAs":"definedAs","pathTo":"pathTo","_variables":{}}""").as[JsObject])
      assert(results.get === "let definedAs = require('pathTo')")
    }
  }

  describe("mutate") {
    it("can mutate valid code") {
      val results = TestLens.testLensMutate(importExample, "using-require", "let definedAs = require('pathTo')", "es7",
        Json.parse("""{"definedAs":"testing","pathTo":"how_this_works","_variables":{}}""").as[JsObject])
      assert(results.get === "let testing = require('how_this_works')")
    }
  }

}
