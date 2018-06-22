package com.opticdev.arrow.graph

import com.opticdev.arrow.ExampleSourcegears
import com.opticdev.arrow.index.IndexSourceGear
import org.scalatest.FunSpec
import KnowledgeGraphImplicits._
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.Fixture.TestBase
import com.opticdev.opm.TestPackageProviders

class KnowledgeGraphImplicitsSpec extends TestBase with TestPackageProviders {

  def fixture = new {
    val knowledgeGraphWithTransformations = ExampleSourcegears.sgWithTransformations.knowledgeGraph
    val sourcegearhWithTransformations = ExampleSourcegears.sgWithTransformations
    val simpleKnowledgeGraph = ExampleSourcegears.exampleProjectSG.knowledgeGraph
  }

  it("can find schema nodes by ref") {
    val f = fixture
    val ref = SchemaRef(Some(PackageRef("optic:test")), "model")
    val resultsOption = f.knowledgeGraphWithTransformations.schemaNodeForRef(ref)

    assert(resultsOption.isDefined)
    assert(resultsOption.get.schema.schemaRef == SchemaRef(Some(PackageRef("optic:test", "0.1.0")), "model"))
  }

  it("can find gears for schemas") {
    val f = fixture
    val gears = f.simpleKnowledgeGraph.gearsForSchema(SchemaRef(Some(PackageRef("optic:rest", "0.1.0")), "parameter"))
    assert(gears.size == 1)
  }

  it("can find direct transformations for a schema") {
    val f = fixture
    val ref = SchemaRef(Some(PackageRef("optic:test")), "model")

    val results = f.knowledgeGraphWithTransformations.availableTransformations(ref)

    assert(results.size == 1)
  }

  it("will not find the inverse of a transformation") {
    import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
    val f = fixture
    val ref = SchemaRef(Some(PackageRef("optic:test")), "route")

    val results = f.knowledgeGraphWithTransformations.availableTransformations(ref)


    assert(!results.map(_.transformation.resolvedOutput(f.sourcegearhWithTransformations.sourceGear)).contains(Some(SchemaRef(Some(PackageRef("optic:test")), "model"))))

  }

}
