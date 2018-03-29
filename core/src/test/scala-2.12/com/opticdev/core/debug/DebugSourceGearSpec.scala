package com.opticdev.core.debug

import better.files.File
import com.opticdev.core.Fixture.TestBase

class DebugSourceGearSpec extends TestBase {

  lazy val testPackage = File("test-examples/resources/example_markdown/Mongoose.md")

  it("can parse a markdown file") {
    val parsed = DebugSourceGear.parseString(testPackage.contentAsString)

    assert(parsed.get.astGraph.size == 11)
    assert(parsed.get.modelNodes.size == 5)

    val bySchema = parsed.get.modelNodes.groupBy(_.schemaId)
    assert(bySchema(DebugSchemaProxy.schemaNode).size == 2)
    assert(bySchema(DebugSchemaProxy.lensNode).size == 2)
    assert(bySchema(DebugSchemaProxy.transformationNode).size == 1)

  }

}
