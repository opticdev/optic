package com.opticdev.arrow.graph

import com.opticdev.arrow.ExampleSourcegears
import com.opticdev.arrow.index.IndexSourceGear
import org.scalatest.FunSpec
import KnowledgeGraphImplicits._
import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}

class KnowledgeGraphImplicitsSpec extends TestBase with TestPackageProviders {

  def fixture = new {
    val knowledgeGraphWithTransformations = ExampleSourcegears.sgWithTransformations.knowledgeGraph
    val simpleKnowledgeGraph = ExampleSourcegears.exampleProjectSG.knowledgeGraph
  }

  it("can find schema nodes by ref") {
    val f = fixture
    val ref = SchemaRef(PackageRef("optic:test"), "model")
    val resultsOption = f.knowledgeGraphWithTransformations.schemaNodeForRef(ref)

    assert(resultsOption.isDefined)
    assert(resultsOption.get.schema.schemaRef == ref)
  }

  it("can find gears for schemas") {
    val f = fixture
    val gears = f.simpleKnowledgeGraph.gearsForSchema(SchemaRef(PackageRef("optic:rest", "0.1.0"), "parameter"))
    assert(gears.size == 1)
  }

  it("can find direct transformations for a schema") {
    val f = fixture
    val ref = SchemaRef(PackageRef("optic:test"), "model")

    val results = f.knowledgeGraphWithTransformations.availableTransformations(ref)

    assert(results.size == 1)
  }

  it("will not find the inverse of a transformation") {
    val f = fixture
    val ref = SchemaRef(PackageRef("optic:test"), "route")

    val results = f.knowledgeGraphWithTransformations.availableTransformations(ref)


    assert(!results.map(_.transformation.output).contains(SchemaRef(PackageRef("optic:test"), "model")))

  }

}
