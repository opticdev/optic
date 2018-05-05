package com.opticdev.core.sourcegear.sync

import com.opticdev.core.Fixture.{AkkaTestFixture, Time}
import com.opticdev.core.sourcegear.project.status.{ErrorSyncing, SyncPending, UpToDate}

class SyncStatusManagerSpec extends AkkaTestFixture("SyncStatusSpec") with SyncFixture {


//  it("can generate a stable sync hash for a project graph") {
//
//    def hashIt = Time.time({
//      val f = fixture("test-examples/resources/example_source/sync/Sync.js")
//      implicit val project = f.project
//      SyncStatus.syncHashForProject(f.updatedGraphResults.syncGraph)
//    })
//
//    assert(Set(hashIt, hashIt, hashIt, hashIt).size == 1)
//
//  }


  it("will not show a pending sync when everything is up to date") {
    val f = fixture("test-examples/resources/example_source/sync/InSync.js")
    implicit val project = f.project
    assert(SyncStatusManager.getStatus(project.projectGraph) == UpToDate)
  }

  it("will show a pending sync when things are not up to date") {
    val f = fixture("test-examples/resources/example_source/sync/NotInSync.js")
    implicit val project = f.project
    assert(SyncStatusManager.getStatus(project.projectGraph) == SyncPending)
  }

  it("will show an error if sync was invalid") {
    val f = fixture("test-examples/resources/example_source/sync/InvalidSync.js")
    implicit val project = f.project
    assert(SyncStatusManager.getStatus(project.projectGraph).isInstanceOf[ErrorSyncing])
    assert(SyncStatusManager.getStatus(project.projectGraph).asInstanceOf[ErrorSyncing].error.contains("No Transformation with id 'optic:synctest@latest/errrrrrrorrrrrrrr"))
  }

}
