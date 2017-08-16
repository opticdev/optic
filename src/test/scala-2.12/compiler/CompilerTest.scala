package compiler

import org.scalatest.FunSpec
import play.api.libs.json.Json
import sdk.SdkDescription

import scala.collection.mutable.ListBuffer
import scala.io.Source

class CompilerTest extends FunSpec {

  describe("Compiler") {

    val jsonString = Source.fromFile("src/test/resources/sdkDescriptions/ImportExample.json").getLines.mkString
    val description = SdkDescription.fromJson(Json.parse(jsonString))

    describe("can be setup") {

      describe("with a test description") {
        val pool = compiler_new.Compiler.setup(description)

        assert(pool.compilers.size == 1)

      }
    }

    describe("for individual lenses") {

      it("works when valid") {

        val worker = new compiler_new.Compiler.CompileWorker(description.lenses.head)

        println(worker.compile()(description.schemas, description.lenses, ListBuffer()))

      }

    }

  }

}
