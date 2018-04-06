package com.opticdev.arrow.graph

import com.opticdev.arrow.ExampleSourcegears
import com.opticdev.arrow.graph.GraphSerialization.jsonFromEdge
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.CompiledLens
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.SchemaRef
import org.scalatest.FunSpec
import play.api.libs.json.Json
import scalax.collection.edge.LkDiEdge

import scala.reflect.ClassTag

class GearSerializationSpec extends TestBase with TestPackageProviders {

  lazy val exampleProjectSG = ExampleSourcegears.exampleProjectSG.sourceGear

  it("can turn a gear node into json") {
    val json = GraphSerialization.jsonFromNode(GearNode(exampleProjectSG.lensSet.listGears.find(_.name.contains("Parameter")).get))
    assert(json == Json.parse("""{"id":"a8e4b19b","name":"Parameter","packageFull":"optic:express-js@0.1.0","type":"gear"}"""))
  }

  it("can turn a schema node into json") {
    val json = GraphSerialization.jsonFromNode(SchemaNode(exampleProjectSG.schemas.find(_.name.contains("Parameter")).get))
    assert(json == Json.parse("""{"id":"optic:rest@0.1.0/parameter","name":"Parameter","packageFull":"optic:rest@0.1.0","type":"schema"}"""))
  }


  it("can serialize a basic graph") {
    val graph = IndexSourceGear.runFor(exampleProjectSG)
    val result = GraphSerialization.serialize(graph)

    assert(result == Json.parse("""{"nodes":[{"id":"optic:rest@0.1.0/route","name":"Route","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"85c0d9c3","name":"Example Route","packageFull":"optic:express-js@0.1.0","type":"gear"},{"id":"optic:rest@0.1.0/parameter","name":"Parameter","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"a8e4b19b","name":"Parameter","packageFull":"optic:express-js@0.1.0","type":"gear"}],"edges":[{"n1":"optic:rest@0.1.0/route","n2":"85c0d9c3"},{"n1":"optic:rest@0.1.0/parameter","n2":"a8e4b19b"}]}"""))
  }

  it("can serialize a graph with transformations") {
    val exampleProjectSG = ExampleSourcegears.sgWithTransformations.sourceGear
    val graph = IndexSourceGear.runFor(exampleProjectSG)
    val result = GraphSerialization.serialize(graph)

    assert(result == Json.parse("""{"nodes":[{"id":"optic:test@0.1.0/model","name":"model","packageFull":"optic:test@0.1.0","type":"schema"},{"id":"optic:test@0.1.0/route","name":"route","packageFull":"optic:test@0.1.0","type":"schema"},{"id":"optic:test@0.1.0/form","name":"form","packageFull":"optic:test@0.1.0","type":"schema"},{"id":"optic:test@0.1.0/fetch","name":"fetch","packageFull":"optic:test@0.1.0","type":"schema"}],"edges":[{"from":"optic:test@0.1.0/model","to":"optic:test@0.1.0/route","label":{"name":"Model -> Route","packageFull":"optic:test-transform@latest"},"isTransformation":true},{"from":"optic:test@0.1.0/route","to":"optic:test@0.1.0/form","label":{"name":"Route -> Form","packageFull":"optic:test-transform@latest"},"isTransformation":true},{"from":"optic:test@0.1.0/route","to":"optic:test@0.1.0/fetch","label":{"name":"Route -> Fetch","packageFull":"optic:test-transform@latest"},"isTransformation":true}]}"""))
  }


}
