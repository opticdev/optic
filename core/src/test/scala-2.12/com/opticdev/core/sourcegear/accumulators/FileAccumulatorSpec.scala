package com.opticdev.core.sourcegear.accumulators

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.core.actorSystem
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.SourceParserManager
import play.api.libs.json.{JsObject, Json}

class FileAccumulatorSpec extends AkkaTestFixture("FileAccumulatorTest") with GearUtils {

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear)

  it("map schemas finds all valid instances") {

    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress_non_distinct_params@0.1.0.json")
    val result = sourceGear.parseFile(File("test-examples/resources/example_source/ExampleExpress.js"))

    implicit val sourceGearContext = SGContext(sourceGear.fileAccumulator, result.get.astGraph, SourceParserManager.installedParsers.head, null, sourceGear)

    assert(result.isSuccess && result.get.modelNodes.size == 6)

    val expected = Json.parse(
      """{
        |	"parameters": [{
        |		"name": "firstLevel",
        |		"in": "query"
        |	}, {
        |		"name": "nested",
        |		"in": "body"
        |	}, {
        |		"name": "nested",
        |		"in": "body"
        |	}, {
        |		"name": "bob",
        |		"in": "header"
        |	}],
        |	"method": "get",
        |	"url": "url"
        |}""".stripMargin)

    val modelNode = result.get.modelNodes.find(_.schemaId == SchemaRef(Some(PackageRef("optic:FlatExpress", "0.1.0")), "route")).get
    val expandedValue = modelNode.expandedValue

    assert(expandedValue == expected)

  }

  it("map unique schemas finds valid + distinct instances") {

    val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:FlatExpress@0.1.0.json")
    val result = sourceGear.parseFile(File("test-examples/resources/example_source/ExampleExpress.js"))

    implicit val sourceGearContext = SGContext(sourceGear.fileAccumulator, result.get.astGraph, SourceParserManager.installedParsers.head, null, sourceGear)

    assert(result.isSuccess && result.get.modelNodes.size == 6)

    val expected = Json.parse(
      """{
        |	"parameters": [{
        |		"name": "firstLevel",
        |		"in": "query"
        |	}, {
        |		"name": "nested",
        |		"in": "body"
        |	}, {
        |		"name": "bob",
        |		"in": "header"
        |	}],
        |	"method": "get",
        |	"url": "url"
        |}""".stripMargin)

    val modelNode = result.get.modelNodes.find(_.schemaId == SchemaRef(Some(PackageRef("optic:FlatExpress", "0.1.0")), "route")).get
    val expandedValue = modelNode.expandedValue
    assert(expandedValue == expected)

  }


  
}
