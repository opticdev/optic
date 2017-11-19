package com.opticdev.core.compiler

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sdk.SdkDescription
import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.core.compiler.Compiler

import scala.collection.mutable.ListBuffer
import scala.io.Source

class CompilerTest extends TestBase {

  describe("Compiler") {

    val jsonString = Source.fromFile("test-examples/resources/sdkDescriptions/ImportExample.json").getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString)).get

    describe("can be setup") {

      it("with a test description") {
        val pool = Compiler.setup(description)
        assert(pool.compilers.size == 1)
      }
    }

    describe("for individual lenses") {

      it("works when valid") {
        val compiler = Compiler.setup(description)
        val finalOutput = compiler.execute

        assert(finalOutput.isSuccess)
        assert(!finalOutput.isFailure)
        assert(finalOutput.gears.size == 1)
        assert(finalOutput.errors.size == 0)

      }

    }

    describe("for complicated lenses") {
      it("works when valid") {
        val jsonString = Source.fromFile("test-examples/resources/sdkDescriptions/RequestSdkDescription.json").getLines.mkString
        val description = SdkDescription.fromJson(Json.parse(jsonString)).get

        val compiler = Compiler.setup(description)
        val finalOutput = compiler.execute

        finalOutput.printErrors
        assert(finalOutput.isSuccess)


      }
    }

  }

}
