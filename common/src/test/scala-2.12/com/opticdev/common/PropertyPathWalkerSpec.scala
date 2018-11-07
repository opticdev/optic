package com.opticdev.common

import com.opticdev.common.graph.path.PropertyPathWalker
import com.opticdev.common.graph.{BaseNode, CommonAstNode}
import org.scalatest.FunSuite
import play.api.libs.json.{JsObject, JsString}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class PropertyPathWalkerSpec extends FunSuite {

  implicit val graph: Graph[BaseNode, LkDiEdge] = Graph()

  val testNode = CommonAstNode(null, null,
    JsObject(Seq(
      "name"-> JsString("Hello"),
      "foo"-> JsObject(Seq("test"-> JsString("Haven"))
      ))))


  test("hasProperty works") {

    val propertyPathWalker = new PropertyPathWalker(testNode)

    assert(propertyPathWalker.hasProperty(Seq("name")))
    assert(!propertyPathWalker.hasProperty(Seq("bar")))
    assert(propertyPathWalker.hasProperty(Seq("foo", "test")))

  }

  test("getProperty works") {

    val propertyPathWalker = new PropertyPathWalker(testNode)

    assert(propertyPathWalker.getProperty(Seq("name")).isDefined)
    assert(propertyPathWalker.getProperty(Seq("name")).get == JsString("Hello"))

    assert(propertyPathWalker.getProperty(Seq("foo", "test")).isDefined)
    assert(propertyPathWalker.getProperty(Seq("foo", "test")).get == JsString("Haven"))

  }

}
