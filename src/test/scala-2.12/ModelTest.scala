import java.io.File

import Fixture.{PostTest, PreTest, TestBase}
import TestClasses.{TestAstExtensionManager, TestInsightManager, TestModelManager}
import cognitro.parsers.GraphUtils.{ModelType, NodeType}
import nashorn.NashornParser
import org.scalatest.FunSuite
import play.api.libs.json.{JsObject, JsString}
import providers.Provider
import sourceparsers.SourceParserManager

class ModelTest extends TestBase {

  describe("Model") {
    it("Gets a Model from the JS") {

      val modelTestpath = "src/test/resources/models/modelTest.js"
      val output = parser.parse(new File(modelTestpath))

      assert(output.models.size == 1)
    }


    it("Validates properly") {

      val modelTestpath = "src/test/resources/models/modelTest.js"
      val output = parser.parse(new File(modelTestpath))

      val myModel = output.models.head

      val instanceOfMyModel = myModel.instanceOf(
        JsObject(Seq(
          "definedAs" -> JsString("example"),
          "path" -> JsString("thing")
        ))
      )

      assert(instanceOfMyModel != null)

      assertThrows[Error] { // Result type: Assertion
        myModel.instanceOf(
          JsObject(Seq(
            "definedAs" -> JsString("example")
          )) )
      }

    }

    it("Can load a model by key once inside the system") {
      val modelTestpath = "src/test/resources/models/modelTest.js"
      val output = parser.parse(new File(modelTestpath))

      val myModel = output.models.head

      TestModelManager.addModel(myModel)

      assert(provider.modelProvider.modelByIdentifier(ModelType("JS.Import")).isDefined)
    }


  }

}
