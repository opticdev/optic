package com.opticdev.arrow.graph

import com.opticdev.arrow.ExampleSourcegears
import com.opticdev.arrow.graph.GraphSerialization.jsonFromEdge
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.Gear
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.SchemaRef
import org.scalatest.FunSpec
import play.api.libs.json.Json
import scalax.collection.edge.LkDiEdge

import scala.reflect.ClassTag

class GearSerializationSpec extends TestBase with TestPackageProviders {

  lazy val exampleProjectSG = ExampleSourcegears.exampleProjectSG.sourceGear

  it("can turn a gear node into json") {
    val json = GraphSerialization.jsonFromNode(GearNode(exampleProjectSG.gearSet.listGears.find(_.name.contains("Parameter")).get))
    assert(json == Json.parse("""{"id":"f1cc4d30","name":"Parameter","packageFull":"optic:express-js@0.1.0","type":"gear"}"""))
  }

  it("can turn a schema node into json") {
    val json = GraphSerialization.jsonFromNode(SchemaNode(exampleProjectSG.schemas.find(_.name.contains("Parameter")).get))
    assert(json == Json.parse("""{"id":"optic:rest@0.1.0/parameter","name":"Parameter","packageFull":"optic:rest@0.1.0","type":"schema"}"""))
  }


  it("can serialize a basic graph") {
    val graph = IndexSourceGear.runFor(exampleProjectSG)
    val result = GraphSerialization.serialize(graph)

    assert(result == Json.parse("""{"nodes":[{"id":"optic:rest@0.1.0/route","name":"Route","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"f1cc4d30","name":"Parameter","packageFull":"optic:express-js@0.1.0","type":"gear"},{"id":"optic:rest@0.1.0/parameter","name":"Parameter","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"aacee631","name":"Example Route","packageFull":"optic:express-js@0.1.0","type":"gear"}],"edges":[{"n1":"optic:rest@0.1.0/route","n2":"aacee631"},{"n1":"optic:rest@0.1.0/parameter","n2":"f1cc4d30"}]}"""))
  }

  it("can serialize a graph with transformations") {
    val exampleProjectSG = ExampleSourcegears.sgWithTransformations.sourceGear
    val graph = IndexSourceGear.runFor(exampleProjectSG)
    val result = GraphSerialization.serialize(graph)

    assert(result == Json.parse("""{"nodes":[{"id":"optic:test@latest/model","name":"model","packageFull":"optic:test@latest","type":"schema"},{"id":"optic:test@latest/fetch","name":"fetch","packageFull":"optic:test@latest","type":"schema"},{"id":"optic:test@latest/form","name":"form","packageFull":"optic:test@latest","type":"schema"},{"id":"optic:test@latest/route","name":"route","packageFull":"optic:test@latest","type":"schema"}],"edges":[{"from":"optic:test@latest/model","to":"optic:test@latest/route","label":{"name":"Model -> Route","packageFull":"optic:test-transform@latest"},"isTransformation":true},{"from":"optic:test@latest/route","to":"optic:test@latest/form","label":{"name":"Route -> Form","packageFull":"optic:test-transform@latest"},"isTransformation":true},{"from":"optic:test@latest/route","to":"optic:test@latest/fetch","label":{"name":"Route -> Fetch","packageFull":"optic:test-transform@latest"},"isTransformation":true}]}"""))
  }


}
