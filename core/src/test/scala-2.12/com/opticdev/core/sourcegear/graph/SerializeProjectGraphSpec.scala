package com.opticdev.core.sourcegear.graph

import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.edges.ContainerRoot
import com.opticdev.core.sourcegear.sync.{DiffSyncGraph, SyncFixture}
import com.opticdev.opm.TestPackageProviders
import play.api.libs.json.Json
import scalax.collection.mutable.Graph

import scala.concurrent.duration._
import scala.concurrent.Await

class SerializeProjectGraphSpec extends AkkaTestFixture("DiffSyncGraphSpec") with SyncFixture with GearUtils with TestPackageProviders {

  it("can use snapshot functionality to extract all named objects from project") {
    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project

    val serializeResult = SerializeProjectGraph.fromProject(project)

    val result = Await.result(serializeResult, 20 seconds)

    assert(result.size == 3)
    assert(result.toJson == Json.parse("""[{"name":"Good Morning","expandedValue":{"value":"good morning"},"schema":"optic:synctest@0.1.0/source-schema"},{"name":"Welcome To","expandedValue":{"value":"welcome to"},"schema":"optic:synctest@0.1.0/source-schema"},{"name":"Hello Model","expandedValue":{"value":"hello"},"schema":"optic:synctest@0.1.0/source-schema"}]"""))
  }

  it("can deserialize into object nodes") {

    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project

    val serializeResult = SerializeProjectGraph.fromProject(project)

    val result = Await.result(serializeResult, 20 seconds)

    val graph = SerializeProjectGraph.projectGraphFrom(result, "Test Project")

    assert(graph.graphSize == 3)

  }

}
