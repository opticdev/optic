package LensCapabilities

import java.io.File

import Fixture.{PostTest, PreTest, Simulate, TestBase}
import TestClasses.{TestAstExtensionManager, TestInsightManager, TestModelManager}
import compiler.Compiler
import nashorn.NashornParser
import org.scalatest.FunSuite
import providers.Provider
import sourceparsers.SourceParserManager
import graph.GraphAccessor._
import graph.GraphManager
import nashorn.scriptobjects.SharedStore


class VariableTest extends TestBase {

  describe("Variables") {
    describe("Shared value") {
      val sharedValue = new SharedStore()

      describe("Responds the right boolean value when instantiated with a value") {
        it("Works for strings") {
          assert(sharedValue.value("hello", "world"))
          assert(sharedValue.value("hello", "world"))
          assert(!sharedValue.value("hello", "pizza"))
        }
        it("Works for numbers") {
          assert(sharedValue.value("world", 2))
          assert(sharedValue.value("world", 2))
          assert(!sharedValue.value("world", 15))
        }
        it("Works for objects") {
          assert(!sharedValue.value("world", Console))
        }
      }
    }

    describe("Compile phase") {
      val lensTestPath = "src/test/resources/examples/ExampleCall.js"
      val output = parser.parse(new File(lensTestPath))
      Compiler.compile(output.lenses.head)
    }

    describe("It matches code that is not identical if variables are set") {
      val lensTestPath = "src/test/resources/lenses/VariableExampleLens.js"
      val output = parser.parse(new File(lensTestPath))

      val insightWriter = Compiler.compile(output.lenses.head)

      val insight = Simulate.fromWriter(insightWriter, "FunctionDeclaration")

      def testFile(contents: String): GraphManager =  Simulate.evaluateString(contents, "Javascript")

      it("Matches when it should") {
        provider.insightProvider.addInsight(insight)
        assert(testFile("function me () {\n    var hello = require('example-one/test')\n    hello.world('world')\n}").getGraph.insightModels.size == 1)
        assert(testFile("function me () {\n    var test2 = require('example-one/test')\n    test2.world('world')\n}").getGraph.insightModels.size == 1)
      }

      it("Does not match when it should") {
        assert(testFile("function me () {\n    var test2 = require('example-one/test')\n    hello.world('world')\n}").getGraph.insightModels.size == 0)
        assert(testFile("function me () {\n    var test2 = require('example-one/test')\n    pizza.world('world')\n}").getGraph.insightModels.size == 0)
        assert(testFile("function me () {\n    pizza.world('world')\n}").getGraph.insightModels.size == 0)
      }
    }

  }

}
