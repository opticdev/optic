import java.io.File

import Fixture.{PostTest, PreTest, TestBase}
import TestClasses.{TestAstExtensionManager, TestInsightManager, TestModelManager}
import graph.GraphAccessor._
import graph.GraphManager
import nashorn.NashornParser
import org.scalatest.{BeforeAndAfter, BeforeAndAfterEach, FunSuite}
import play.api.libs.json.{JsObject, JsString}
import providers.Provider
import sourceparsers.SourceParserManager

class InsightTest extends TestBase with BeforeAndAfterEach {

  describe("Insight") {

    it("Can load an insight") {
      val skillTestPath = "src/test/resources/insights/ImportJsInsight.js"
      val insights = parser.parse(new File(skillTestPath)).insights

      assert(insights.size == 1)
      assert(insights.head.name == "Import")
    }

    it("Loaded insights can be added to a parser") {
      installInsight("src/test/resources/insights/ImportJsInsight.js")
    }

    describe("Updating code from insights") {

      val filePath = "src/test/resources/tmp/test/importInsightTest.js"

      val testFile = new File(filePath)

      val parsedFile = SourceParserManager.parseFile(testFile)

      val graphManager = new GraphManager

      val skillTestPath = "src/test/resources/insights/ImportJsInsight.js"
      val output = parser.parse(new File(skillTestPath))

      provider.insightProvider.addInsights(output.insights:_*)
      provider.modelProvider.addModels(output.models:_*)

      graphManager.addParsedFileToGraph(parsedFile.get)
      graphManager.interpretGraph()

      implicit val graph = graphManager.getGraph

      val models = graph.insightModels

      it("Finds models in source code") {
        assert(models.size == 1)
      }

      val newModel = JsObject(Seq(
        "definedAs" -> JsString("TESTING"),
        "path" -> JsString("/asd/asd/asd")
      ))

      val model = models.find(i=> {
        val here = i.getValue \ "definedAs"
        val stringValue = here.get.asInstanceOf[JsString].value
        stringValue == "human"   //choose which model we want to mutate
      })

      it("Updates models without any errors") {
        val success = model.get.updateValue(newModel)
        assert(success)

        val contents = better.files.File(filePath).contentAsString

        assert(contents ==
          "var TESTING = require(\"/asd/asd/asd\");"
        )
      }
    }
  }

}
