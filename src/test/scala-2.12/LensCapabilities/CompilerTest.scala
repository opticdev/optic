package LensCapabilities

import java.io.File

import Fixture.{PostTest, PreTest, TestBase}
import TestClasses.{TestAstExtensionManager, TestInsightManager, TestModelManager}
import compiler.Compiler
import nashorn.NashornParser
import org.scalatest.FunSuite
import providers.Provider
import sourceparsers.SourceParserManager


class CompilerTest extends TestBase {

  describe("Compiler") {

    describe("Lens compiler") {
      it("Can read a lens file") {

        //get a model
        val modelTestpath = "src/test/resources/models/modelTest.js"
        val output1 = parser.parse(new File(modelTestpath))

        val myModel = output1.models.head

        TestModelManager.addModel(myModel)

        val output2 = parser.parse(new java.io.File(getCurrentDirectory + "/src/test/resources/examples/ExampleLens.js"))
        assert(output2.lenses.size == 1)

        val thisLens = output2.lenses.head

        assert(thisLens.modelDefinition == myModel)

      }

      it("Can compile a lens file") {

        //get a model
        val modelTestpath = "src/test/resources/models/modelTest.js"
        val output1 = parser.parse(new File(modelTestpath))

        val myModel = output1.models.head

        TestModelManager.addModel(myModel)

        val output2 = parser.parse(new java.io.File(getCurrentDirectory + "/src/test/resources/examples/ExampleLens.js"))
        assert(output2.lenses.size == 1)

        val thisLens = output2.lenses.head

        assert(thisLens.modelDefinition == myModel)

        Compiler.compile(thisLens)

      }

      it("Throws an error if example is invalid") {
        val output= parser.parse(new java.io.File(getCurrentDirectory+"/src/test/resources/examples/FaultyExampleLens.js"))
        assert(output.lenses.size == 1)

        val thisLens = output.lenses.head

        assertThrows[Error] {
          Compiler.compile(thisLens)
        }

      }
    }
  }

}
