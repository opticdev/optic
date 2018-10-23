package com.opticdev.arrow.graph

import com.opticdev.arrow.ExampleSourcegears
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.CompiledLens
import com.opticdev.opm.TestPackageProviders
import com.opticdev.common.SchemaRef
import org.scalatest.FunSpec
import play.api.libs.json.Json
import scalax.collection.edge.LkDiEdge

import scala.reflect.ClassTag

class GearSerializationSpec extends TestBase with TestPackageProviders {

  lazy val exampleProjectSG = ExampleSourcegears.exampleProjectSG.sourceGear

  it("can turn a gear node into json") {
    val json = GraphSerialization.jsonFromNode(LensNode(exampleProjectSG.lensSet.listLenses.find(_.id == "parameter").get))
    assert(json == Json.parse("""{"id":"optic:express-js@0.1.0/parameter","name":"Parameter","packageFull":"optic:express-js@0.1.0","internal":false,"priority":1,"type":"lens"}"""))
  }

  it("can turn a schema node into json") {
    val json = GraphSerialization.jsonFromNode(SchemaNode(exampleProjectSG.schemas.find(_.name.contains("Parameter")).get))
    assert(json == Json.parse("""{"id":"optic:rest@0.1.0/parameter","name":"Parameter","packageFull":"optic:rest@0.1.0","type":"schema"}"""))
  }


  it("can serialize a basic graph") {
    val graph = IndexSourceGear.runFor(exampleProjectSG)
    val result = GraphSerialization.serialize(graph)(exampleProjectSG)
    assert(result == Json.parse("""{"nodes":[{"id":"optic:express-js@0.1.0/route","name":"Route","packageFull":"optic:express-js@0.1.0","internal":false,"priority":1,"type":"lens"},{"id":"optic:rest@0.1.0/parameter","name":"Parameter","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"optic:express-js@0.1.0/response","name":"Response","packageFull":"optic:express-js@0.1.0","internal":false,"priority":1,"type":"lens"},{"id":"optic:rest@0.1.0/route","name":"Route","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"optic:rest@0.1.0/response","name":"Response","packageFull":"optic:rest@0.1.0","type":"schema"},{"id":"optic:express-js@0.1.0/parameter","name":"Parameter","packageFull":"optic:express-js@0.1.0","internal":false,"priority":1,"type":"lens"}],"edges":[{"n1":"optic:rest@0.1.0/parameter","n2":"optic:express-js@0.1.0/parameter"},{"n1":"optic:rest@0.1.0/route","n2":"optic:express-js@0.1.0/route"},{"n1":"optic:rest@0.1.0/response","n2":"optic:express-js@0.1.0/response"}]}"""))
  }

  it("can serialize a graph with transformations") {
    val exampleProjectSG = ExampleSourcegears.sgWithTransformations.sourceGear
    val graph = IndexSourceGear.runFor(exampleProjectSG)
    val result = GraphSerialization.serialize(graph)(exampleProjectSG)

    assert(result == Json.parse("""{"nodes":[{"id":"optic:test@0.1.0/model","name":"model","packageFull":"optic:test@0.1.0","type":"schema"},{"id":"optic:test@0.1.0/route","name":"route","packageFull":"optic:test@0.1.0","type":"schema"},{"id":"optic:test@0.1.0/form","name":"form","packageFull":"optic:test@0.1.0","type":"schema"},{"id":"optic:test@0.1.0/fetch","name":"fetch","packageFull":"optic:test@0.1.0","type":"schema"}],"edges":[{"from":"optic:test@0.1.0/model","fromName":"model","toName":"route","to":"optic:test@0.1.0/route","label":{"name":"Model -> Route","packageFull":"optic:test-transform@latest"},"transformationRef":"optic:test-transform@latest/m2r","isTransformation":true},{"from":"optic:test@0.1.0/route","fromName":"route","toName":"form","to":"optic:test@0.1.0/form","label":{"name":"Route -> Form","packageFull":"optic:test-transform@latest"},"transformationRef":"optic:test-transform@latest/r2f","isTransformation":true},{"from":"optic:test@0.1.0/route","fromName":"route","toName":"fetch","to":"optic:test@0.1.0/fetch","label":{"name":"Route -> Fetch","packageFull":"optic:test-transform@latest"},"transformationRef":"optic:test-transform@latest/r2fe","isTransformation":true}]}"""))
  }


}
