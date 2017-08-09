import java.io.File

import Fixture.{PostTest, PreTest, TestBase}
import TestClasses.{TestAstExtensionManager, TestInsightManager, TestModelManager}
import graph.AstNodeWrapper
import nashorn.NashornParser
import org.scalatest.FunSuite
import play.api.libs.json.{JsObject, JsString}
import providers.Provider
import sourceparsers.SourceParserManager


class AstExtensionTest extends TestBase {

  describe("Ast Extensions") {

    it("Can be instantiated through a file ") {
      val modelTestpath = "src/test/resources/extensions/AstExtensionTest.js"
      val output = parser.parse(new File(modelTestpath))

      assert(output.extensions.size == 1)
    }

    it("Cn be added to AstPrimitive Nodes") {

      val modelTestpath = "src/test/resources/extensions/AstExtensionTest.js"
      val output = parser.parse(new File(modelTestpath))

      val extension = output.extensions.head

      val template = "var hello = require('world');"
      val parsed = SourceParserManager.parseString(template, "Javascript")

      val rootNode = parsed._2
      implicit val graph = parsed._1


      val children = rootNode.getChildren(graph)
      val variableDeclaration = children.head._2

      variableDeclaration.addExtension(extension)

      val fileNode = rootNode.fileNode(graph)
      println(fileNode.contents)


      val node = AstNodeWrapper(variableDeclaration)


      assert(fileNode.contents == "var hello = require('world');")


      node.updateValue(
        JsObject(Seq("kind"-> JsString("let")))
      )

      assert(fileNode.contents == "let hello = require('world');")

    }


  }

}

