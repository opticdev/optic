package com.opticdev.core.sourcegear.snapshot

import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.sync.SyncFixture
import com.opticdev.opm.TestPackageProviders
import org.scalatest.FunSpec
import scala.concurrent.duration._
import scala.concurrent.Await

class SnapshotSpec extends AkkaTestFixture("SnapshotSpec") with SyncFixture with GearUtils with TestPackageProviders {

  it("can create a snapshot from a project") {
    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project
    project.stageProjectGraph(f.updatedGraphResults.syncGraph)

    val snapshot = project.snapshot

    val result = Await.result(snapshot, 20 seconds)

    assert(result.linkedModelNodes.size == 7)
    assert(result.contextForNode.size == 7)
    assert(result.files.size == 7)
    assert(result.expandedValues.size == 7)

  }

}
