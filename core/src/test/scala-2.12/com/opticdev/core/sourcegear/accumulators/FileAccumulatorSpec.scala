package com.opticdev.core.sourcegear.accumulators

import better.files.File
import com.opticdev.core.actorSystem
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.sdk.descriptions.SchemaId
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.SourceParserManager
import play.api.libs.json.Json

class FileAccumulatorSpec extends AkkaTestFixture("FileAccumulatorTest") with GearUtils {

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)

  it("enables map schemas to work") {

    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress@0.1.0.json")
    val result = sourceGear.parseFile(File("test-examples/resources/example_source/ExampleExpress.js"))

    implicit val sourceGearContext = SGContext(sourceGear.fileAccumulator, result.get.astGraph, SourceParserManager.installedParsers.head, null)

    assert(result.isSuccess && result.get.modelNodes.size == 4)

    val expected = Json.parse(
      """{
        "parameters": [{
          "name": "firstLevel",
          "in": "query"
        }, {
          "name": "nested",
          "in": "body"
        }],
        "url": "url",
        "method": "get"
      }""")

    val modelNode = result.get.modelNodes.find(_.schemaId == SchemaId("route")).get
    assert(modelNode.expandedValue == expected)

  }
  
}
