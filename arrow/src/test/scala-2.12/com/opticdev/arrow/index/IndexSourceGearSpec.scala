package com.opticdev.arrow.index

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.{GearSet, SGConstructor, SourceGear}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.{Schema, SchemaRef, Transformation}
import play.api.libs.json.JsObject

import scala.concurrent.duration._
import scala.concurrent.Await

class IndexSourceGearSpec extends TestBase with TestPackageProviders {

  lazy val sourcegear = {
    val future = SGConstructor.fromProjectFile(new ProjectFile(File("test-examples/resources/example_packages/express/optic.yaml")))
    Await.result(future, 10 seconds)
  }.inflate

  it("can map schema and gear connections") {
    val knowledgeGraph = IndexSourceGear.runFor(sourcegear)
    assert(knowledgeGraph.nodes.size == 4)
    assert(knowledgeGraph.size == 6)
  }


  val schemaModel = Schema(SchemaRef(PackageRef("optic:test"), "model"), JsObject.empty)
  val schemaRoute = Schema(SchemaRef(PackageRef("optic:test"), "route"), JsObject.empty)
  val schemaForm = Schema(SchemaRef(PackageRef("optic:test"), "form"), JsObject.empty)
  val schemaFetch = Schema(SchemaRef(PackageRef("optic:test"), "fetch"), JsObject.empty)

  lazy val sgWithTransformations = new SourceGear {
    override val parsers = Set()
    override val gearSet = new GearSet()
    override val schemas = Set(schemaModel, schemaRoute, schemaForm, schemaFetch)
    override val transformations = Set(
      Transformation(schemaModel.schemaRef, schemaRoute.schemaRef, ""),
      Transformation(schemaRoute.schemaRef, schemaForm.schemaRef, ""),
      Transformation(schemaRoute.schemaRef, schemaFetch.schemaRef, "")
    )
  }

  it("can map transformations") {
    val knowledgeGraph = IndexSourceGear.runFor(sgWithTransformations)

    assert(knowledgeGraph.nodes.size == 4)
    assert(knowledgeGraph.size == 7)
  }



}
