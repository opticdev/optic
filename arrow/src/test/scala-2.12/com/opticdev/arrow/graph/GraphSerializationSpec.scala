package com.opticdev.arrow.graph

import com.opticdev.arrow.ExampleSourcegears
import org.scalatest.FunSpec
import scalax.collection.io.json._

class GraphSerializationSpec extends FunSpec {

  lazy val knowledgeGraphWithTransformations = ExampleSourcegears.sgWithTransformations.knowledgeGraph

  it("can serialize a graph") {
    GraphSerialization.serialize(knowledgeGraphWithTransformations)
  }


}
