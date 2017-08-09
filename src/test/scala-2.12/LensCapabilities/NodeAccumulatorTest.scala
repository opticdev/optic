package LensCapabilities

import Fixture.TestBase
import cognitro.parsers.GraphUtils._
import cognitro.parsers.Utils.Crypto
import graph.{DependencyHash, GraphManager, InsightModelNode}
import nashorn.scriptobjects.accumulators.Collectible
import org.scalatest.TestSuite
import play.api.libs.json.{JsObject, JsString, JsValue, Json}

import scalax.collection.edge.Implicits._
import scala.util.Random
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


class NodeAccumulatorTest extends TestBase {


  describe("Mock Graph") {

      val graph = createMockGraph((graph)=> {

        val fileNode = mockFileNode("FileA")

        it("Can have nodes added") {
          graph.add(fileNode)
          assert(graph.size == 1)
        }

        val astNode = mockAstPrimitiveNode(AstType("TYPE_A"), JsObject(Seq()), fileNode.hash)
        it("Can have edges added") {
          graph.add((fileNode ~+#> astNode) (Produces()))
          assert(graph.size == 3)
        }

        it("Can query properly") {
          assert(astNode.fileNode(graph) == fileNode)
        }

      })

  }

  describe("Node Accumulator") {

    describe("Same file lookup") {

      var fileA : BaseFileNode = null
      var fileB : BaseFileNode = null
      var fileC : BaseFileNode = null

      implicit val graph = createMockGraph((graph) => {

        def addModelToFile(fileName: String, targetMatches: Int) = {
          val fileNodeA = mockFileNode(fileName)

          for( n <- 1 to targetMatches){
            val astNode1 = mockAstPrimitiveNode(AstType("TYPE_A"), JsObject(Seq()), fileNodeA.hash)
            graph.add((fileNodeA ~+#> astNode1) (Produces()))

            val model1 = mockModelNode(ModelType("ModelA"), JsObject(Seq("path"-> JsString("express"))), Vector(astNode1))(graph)

            graph.add((astNode1 ~+#> model1) (Produces("variable")))
          }

          fileNodeA
        }

        fileA = addModelToFile("FileA", 2)
        fileB = addModelToFile("FileB", 0)
        fileC = addModelToFile("FileC", 1)

        def addModelBToFile(modelType: String, fileNode: BaseFileNode, value: JsObject = JsObject(Seq())) = {
          val astNode1 = mockAstPrimitiveNode(AstType("TYPE_"+modelType), JsObject(Seq()), fileNode.hash)
          graph.add((fileNode ~+#> astNode1) (Produces()))

          val model1 = mockModelNode(ModelType(modelType), value, Vector(astNode1))(graph)

          graph.add((astNode1 ~+#> model1) (Produces("variable")))
        }

        addModelBToFile("ModelB", fileB, JsObject(Seq("type"-> JsString("post"))))
        addModelBToFile("ModelB", fileC, JsObject(Seq("type"-> JsString("post"))))

        addModelBToFile("ModelC", fileA)

      })



      describe("Search process") {

        describe("Collect All ModelA") {
          val sameFileJson = Json.parse("""
            {
              "ModelA" : {
                "presence": "distinct",
                "value": {"path": "express"}
              }
            } """)

          val sameFileCollectible = new Collectible(sameFileJson.as[JsObject])

          val results = sameFileCollectible.collectNodes
          it("Finds 3 examples of ModelA {'path': 'express'}") {
            assert(results.get(ModelType("ModelA")).get.size == 3)
          }

          it("Groups nodes by files") {
            val groupResults = sameFileCollectible.groupNodes(results)

            assert(groupResults.size == 3)
            val byFile = groupResults.groupBy(_.locationGroup.baseNode)

            assert(byFile.get(fileA).get.size == 2)
            assert(byFile.get(fileB).isEmpty)
            assert(byFile.get(fileC).get.size == 1)

          }
        }

        describe("Collect All Files with Model A and Model B") {

          val sameFileJson = Json.parse("""
            {
              "ModelA" : {
                "presence": "required",
                "value": {"path": "express"}
              },
              "ModelB" : {
                "presence": "distinct"
              }
            } """)

          val sameFileCollectible = new Collectible(sameFileJson.as[JsObject])


          val results = sameFileCollectible.collectNodes
          it("Finds 3 examples of ModelA {'path': 'express'}") {
            assert(results.get(ModelType("ModelA")).get.size == 3)
          }

          it("Finds 2 examples of ModelB (any value)") {
            assert(results.get(ModelType("ModelB")).get.size == 2)
          }

          it("Groups nodes by files") {
            val groupResults = sameFileCollectible.groupNodes(results)
            assert(groupResults.size == 1)

            val byFile = groupResults.groupBy(_.locationGroup.baseNode)
            assert(byFile.get(fileC).isDefined)
            assert(byFile.get(fileC).get.size == 1)

          }
        }

        describe("Collect All Files with 2 Model A") {

          val sameFileJson = Json.parse("""
            {
              "ModelA" : {
                "presence": "required",
                "occurrence": 2,
                "value": {"path": "express"}
              },
              "ModelC" : {
                "presence": "distinct"
              }
            } """)

          val sameFileCollectible = new Collectible(sameFileJson.as[JsObject])


          val results = sameFileCollectible.collectNodes
          it("Finds 3 examples of ModelA {'path': 'express'}") {
            assert(results.get(ModelType("ModelA")).get.size == 3)
          }

          it("Groups nodes by files") {
            val groupResults = sameFileCollectible.groupNodes(results)
            assert(groupResults.size == 1)

            val byFile = groupResults.groupBy(_.locationGroup.baseNode)
            assert(byFile.get(fileA).isDefined)
            assert(byFile.get(fileA).get.size == 1)

          }
        }

      }
    }
  }


}
