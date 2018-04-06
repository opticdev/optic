package com.opticdev.arrow.index

import better.files.File
import com.opticdev.arrow.ExampleSourcegears
import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.{LensSet, SGConstructor, SourceGear}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.JsObject

import scala.concurrent.duration._
import scala.concurrent.Await

class IndexSourceGearSpec extends TestBase with TestPackageProviders {

  it("can map schema and gear connections") {
    val knowledgeGraph = ExampleSourcegears.exampleProjectSG.knowledgeGraph
    assert(knowledgeGraph.nodes.size == 4)
    assert(knowledgeGraph.size == 6)
  }

  val schemaModel = Schema(SchemaRef(PackageRef("optic:test"), "model"), JsObject.empty)
  val schemaRoute = Schema(SchemaRef(PackageRef("optic:test"), "route"), JsObject.empty)
  val schemaForm = Schema(SchemaRef(PackageRef("optic:test"), "form"), JsObject.empty)
  val schemaFetch = Schema(SchemaRef(PackageRef("optic:test"), "fetch"), JsObject.empty)

  it("can map transformations") {
    val knowledgeGraph = ExampleSourcegears.sgWithTransformations.knowledgeGraph

    assert(knowledgeGraph.nodes.size == 4)
    assert(knowledgeGraph.size == 7)
  }

}
