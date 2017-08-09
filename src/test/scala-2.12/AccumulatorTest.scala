import java.io.File

import Fixture.{Simulate, TestBase}
import TestClasses.{DebuggableGraphManager, TestAccumulatorManager}
import cognitro.parsers.GraphUtils._
import compiler.Compiler
import graph.{AccumulatorModelNode, GraphManager}
import graph.GraphAccessor._
import nashorn.scriptobjects.accumulators.Collectible
import nashorn.scriptobjects.accumulators.Context.BundleScope
import play.api.libs.json.{JsObject, JsString}

class AccumulatorTest extends TestBase {

  describe("Accumulator") {

    it("Should be instantiated by parsing a file") {
      val skillTestPath = "src/test/resources/accumulators/TestAccumulator.js"
      val accumulators = parser.parse(new File(skillTestPath)).accumulators

      assert(accumulators.size == 1)
    }

    val gm = new DebuggableGraphManager()

    implicit val graph = gm.getGraph
    implicit var bundleScope = new BundleScope

    val file1 = parseFile("src/test/resources/accumulators/location/file1.js").get
    val file2 = parseFile("src/test/resources/accumulators/location/file2.js").get
    val file3 = parseFile("src/test/resources/accumulators/location/file3.js").get

    gm.addParsedFileToGraph(file1)
    gm.addParsedFileToGraph(file2)
    gm.addParsedFileToGraph(file3)


    describe("Can extract nodes properly") {

        it("Can install insights, models and accumulators") {
          clearAllProviders

          installInsight("src/test/resources/insights/ImportJsInsight.js")
          installInsightFromLens("src/test/resources/examples/ExampleCall.js")

          val skillTestPath = "src/test/resources/accumulators/TestAccumulator.js"
          val accumulators = parser.parse(new File(skillTestPath)).accumulators

          val testAcuumulator = accumulators.head
          provider.accumulatorProvider.addAccumulator(testAcuumulator)

        }

        it("Extracts models properly") {
          val before = gm.getGraph.nodes.size
          gm.interpretGraph()

          val generations = gm.interpretations.head.generations

          assert(generations.size == 3)

          val first = generations.find(_.number == 0).get
          val second = generations.find(_.number == 1).get
          val third = generations.find(_.number == 2).get

          assert(first.newNodes.size == 5)
          assert(second.newNodes.size == 1)
          assert(second.newNodes.head.asInstanceOf[AccumulatorModelNode].nodeType == ModelType("Express.Usage"))
          assert(third.newNodes.size == 0)

        }


    }

  }




}
