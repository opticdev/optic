package LensCapabilities

import Fixture.TestBase
import java.io.File

import cognitro.parsers.GraphUtils.{FileNode, GraphBuilder, ModelNode, ModelType}
import graph.GraphManager
import jdk.nashorn.api.scripting.ScriptObjectMirror
import nashorn.ScriptObjectUtils
import nashorn.scriptobjects.Presence
import nashorn.scriptobjects.accumulators.{Collectible, CollectibleComponent}
import nashorn.scriptobjects.accumulators.Context.BundleScope
import nashorn.scriptobjects.models.{ModelPattern, ValuePattern}
import play.api.libs.json.{JsObject, JsString}
import sourceparsers.SourceParserManager
import play.api.libs.json._

import scala.io.Source


class CollectibleTest extends TestBase {

  //setup insights
  clearAllProviders
  installInsight("src/test/resources/insights/ImportJsInsight.js")
  installInsightFromLens("src/test/resources/examples/ExampleCall.js")


  describe("Collectible") {

    val jsonExample = new File("src/test/resources/accumulators/collectible/JSONExample.js")

    val source = Source
      .fromFile(jsonExample)
      .getLines()
      .mkString("\n")

    val result = ScriptObjectUtils.engine.eval(source).asInstanceOf[ScriptObjectMirror]

    it("Can be loaded from a JSON blob") {
      assert(result != null)
    }

    it("Can be created without reading a file") {

      val collectible = new Collectible(JsObject(
        Seq("JS.Import"->
          JsObject(Seq(
            "presence" -> JsString("required"),
            "value"->
              JsObject(Seq(
                "path"-> JsString("express")
              )))
          )
        )
      ))

      assert(result != null)

    }

    describe("Location matching works") {

      val gm = new GraphManager()
      implicit val graph = gm.getGraph
      implicit var bundleScope = new BundleScope

      val file1 = parseFile("src/test/resources/accumulators/location/file1.js").get
      val file2 = parseFile("src/test/resources/accumulators/location/file2.js").get
      val file3 = parseFile("src/test/resources/accumulators/location/file3.js").get

      gm.addParsedFileToGraph(file1)
      gm.addParsedFileToGraph(file2)
      gm.addParsedFileToGraph(file3)

      gm.interpretGraph()

      describe("Same file lookup works") {

        val sameFileJson = Json.parse("""
            {
              "JS.Import" : {
                "presence": "required",
                "value": {"path": "express"}
              },
              "Express.Usage" : {
                "presence": "distinct"
              }
            } """)

        val sameFileCollectible = new Collectible(sameFileJson.as[JsObject])

        describe("Only finds file2 (matches)") {
          val results = sameFileCollectible.collectibleResponseFromGraph(graph)

          it("Only finds matches in file2") {
            assert(results.size == 1 )
            assert(results.head.locationGroup.baseNode.asInstanceOf[FileNode].filePath.contains("src/test/resources/accumulators/location/file3.js"))
          }

          it("Only exposes the distinct model") {
            assert(results.head.distinctModel.nodeType == ModelType("Express.Usage"))
          }


        }


      }



    }


  }

}
