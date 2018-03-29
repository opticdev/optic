package com.opticdev.core.debug

import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.opm.TestPackageProviders

class DebugSourceGearSpec extends AkkaTestFixture("DebugSourceGearSpec") with TestPackageProviders {

  lazy val testPackage = File("test-examples/resources/example_markdown/Mongoose.md")
  implicit lazy val project : ProjectBase = new DebugMarkdownProject()


  it("can parse a markdown string") {
    val parsed = DebugSourceGear.parseString(testPackage.contentAsString)

    assert(parsed.get.astGraph.size == 21)
    assert(parsed.get.modelNodes.size == 5)

    val bySchema = parsed.get.modelNodes.groupBy(_.schemaId)
    assert(bySchema(DebugSchemaProxy.schemaNode).size == 2)
    assert(bySchema(DebugSchemaProxy.lensNode).size == 2)
    assert(bySchema(DebugSchemaProxy.transformationNode).size == 1)

  }

  it("will fail if there are no annotations") {
    val parsed = DebugSourceGear.parseString("Hello Everyone how are you today")
    assert(parsed.isFailure)
  }

  it("will fail if there are invalid annotations") {
    val parsed = DebugSourceGear.parseString("Hello Everyone how are you today <!-- metadata ne=\"mongoose\" author=\"optic\" version=\"0.1.0\" -->")
    assert(parsed.isFailure)
  }

}
