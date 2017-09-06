package compiler

import Fixture.TestBase
import compiler_new.Failure
import org.scalatest.FunSpec
import play.api.libs.json.Json
import sdk.SdkDescription
import sourceparsers.SourceParserManager

import scala.collection.mutable.ListBuffer
import scala.io.Source

class CompilerTest extends TestBase {

  describe("Compiler") {

    val jsonString = Source.fromFile("src/test/resources/sdkDescriptions/ImportExample.json").getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    describe("can be setup") {

      it("with a test description") {
        val pool = compiler_new.Compiler.setup(description)
        assert(pool.compilers.size == 1)
      }
    }

    describe("for individual lenses") {

      it("works when valid") {
        val compiler = compiler_new.Compiler.setup(description)
        val finalOutput = compiler.execute

        assert(finalOutput.isSuccess)
        assert(!finalOutput.isFailure)
        assert(finalOutput.gears.size == 1)
        assert(finalOutput.errors.size == 0)

      }

    }

    describe("for complicated lenses") {
      it("works when valid") {
        val jsonString = Source.fromFile("src/test/resources/sdkDescriptions/RequestSdkDescription.json").getLines.mkString
        val description = SdkDescription.fromJson(Json.parse(jsonString))

        val compiler = compiler_new.Compiler.setup(description)
        val finalOutput = compiler.execute

        finalOutput.printErrors
        assert(finalOutput.isSuccess)


      }
    }

  }

}
