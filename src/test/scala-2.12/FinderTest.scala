import javax.script.ScriptEngineManager

import Fixture.{PostTest, PreTest, TestBase}
import cognitro.parsers.GraphUtils.{AstType, NodeType}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import compiler.lensparser._
import org.scalatest.FunSuite
import sourceparsers.SourceParserManager

class FinderTest extends TestBase {

  describe("Finders") {

    describe("String finders") {

      val stringFinder = StringFinder("hello");
      val template = "var hello = require('world');"

      val parsed = SourceParserManager.parseString(template, "Javascript")

      println(parsed)

      val node = FinderEvaluator.find(template, parsed._1, parsed._2, stringFinder)

      println(node)

      //found a hit
      it("Can be constructed") {
        assert(node.isDefined)
        assert(node.get.range ==(4, 9))
        assert(node.get.nodeType == AstType("Identifier", "Javascript"))
      }

      it("Finds the correct path") {
        val nWithPath = FinderEvaluator.findWithPath(template, parsed._1, parsed._2, stringFinder)
        val inner = nWithPath._2
        assert(inner.isDefined)
        assert(inner.get.childPath.size == 3)
      }

      it("Work with multiple occurrences?") {

        val template = "var hello = require('world'); hello.goodbye"

        val parsed = SourceParserManager.parseString(template, "Javascript")
        val nWithPath = FinderEvaluator.findWithPath(template, parsed._1, parsed._2, stringFinder)
        val inner = nWithPath._2
        assert(inner.isDefined)
        assert(inner.get.childPath.size == 3)

      }

    }

    describe("Range finder") {

      val rangeFinder = RangeFinder(4,9)
      val template = "var hello = require('world');"

      val parsed = SourceParserManager.parseString(template, "Javascript")


      val node = FinderEvaluator.find(template, parsed._1, parsed._2, rangeFinder)

      it("Can be constructed") {
        assert(node.isDefined)
        assert(node.get.range ==(4, 9))
        assert(node.get.nodeType == AstType("Identifier", "Javascript"))
      }

      val nWithPath = FinderEvaluator.findWithPath(template, parsed._1, parsed._2, rangeFinder)

      val inner = nWithPath._2

      it("Finds the correct path") {
        assert(inner.isDefined)
        assert(inner.get.childPath.size == 3)
      }

    }

    describe("Node finder") {

      val nodeFinder = NodeFinderScala((node)=> {
        node.nodeType == AstType("Identifier", "Javascript")
      })
      val template = "var hello = require('world');"

      val parsed = SourceParserManager.parseString(template, "Javascript")

      val nodes = FinderEvaluator.findAll(template, parsed._1, parsed._2, nodeFinder)

      it("Finds all the nodes") {
        assert(nodes.size == 2)
      }

      //try a JS Node Finder
      val engine = new ScriptEngineManager().getEngineByName("nashorn")
      val block = engine.eval("function (node) { return node.type == 'Identifier' }").asInstanceOf[ScriptObjectMirror]

      val nodeFinderJs = NodeFinderJs(block)

      val nodes2 = FinderEvaluator.findAll(template, parsed._1, parsed._2, nodeFinderJs)
      it("Finds all the using JS code") {
        assert(nodes2.size == 2)
      }

    }

  }



  describe("WalkablePath") {
    val rangeFinder = RangeFinder(4,9)
    val template = "var hello = require('world');"

    val parsed = SourceParserManager.parseString(template, "Javascript")

    val nWithPath = FinderEvaluator.findWithPath(template, parsed._1, parsed._2, rangeFinder)


    val walkablePath = nWithPath._2.get

    val foundNode = walkablePath.walk()

    it("Walks to the correct node") {
      assert(nWithPath._1.get == foundNode)
    }

    val nWithPath2 = FinderEvaluator.findWithPath(template, parsed._1, parsed._2, rangeFinder)
    val walkablePath2 = nWithPath2._2.get

    it("Walks to the correct node, even if the hashcode/graph is different") {
      assert(walkablePath2.walk() == foundNode)
    }

  }

}
