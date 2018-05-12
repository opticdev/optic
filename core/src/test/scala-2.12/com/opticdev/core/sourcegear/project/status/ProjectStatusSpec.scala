package com.opticdev.core.sourcegear.project.status

import java.util.Calendar

import org.scalatest.FunSpec

class ProjectStatusSpec extends FunSpec {

  it("has default state when initialized") {
    val projectStatus = new ProjectStatus()

    assert(projectStatus.loadedStatus == Loaded)
    assert(projectStatus.sourceGearStatus == Empty)
    assert(projectStatus.monitoringStatus == NotWatching)
    assert(projectStatus.configStatus == ValidConfig)
    assert(projectStatus.firstPassStatus == NotStarted)
    assert(projectStatus.syncStatus == UpToDate)

  }

  it("can have its state modified") {
    val projectStatus = new ProjectStatus()

    projectStatus.sourceGearStatus = Valid
    assert(projectStatus.sourceGearStatus == Valid)

    projectStatus.monitoringStatus = NotWatching
    assert(projectStatus.monitoringStatus == NotWatching)

    projectStatus.configStatus = InvalidConfig("")
    assert(projectStatus.configStatus == InvalidConfig(""))

    projectStatus.firstPassStatus = InProgress
    assert(projectStatus.firstPassStatus == InProgress)

    val newTime = Calendar.getInstance().getTime
    projectStatus.lastUpdate = LastUpdateDate(newTime)
    assert(projectStatus.lastUpdate == LastUpdateDate(newTime))
  }

  describe("callbacks") {

    describe("register") {

      it("for sourcegear") {
        val projectStatus = new ProjectStatus()

        var didRun = false
        projectStatus.sourcegearChanged((a) => {
          didRun = true
        })
        projectStatus.sourceGearStatus = Valid
        assert(didRun)
      }

      it("for file monitoring") {
        val projectStatus = new ProjectStatus()

        var didRun = false
        projectStatus.monitoringChanged((a) => {
          didRun = true
        })
        projectStatus.monitoringStatus = Watching
        assert(didRun)
      }

      it("for config") {
        val projectStatus = new ProjectStatus()

        var didRun = false
        projectStatus.configChanged((a) => {
          didRun = true
        })
        projectStatus.configStatus = InvalidConfig("")
        assert(didRun)
      }

      it("for firstpass") {
        val projectStatus = new ProjectStatus()

        var didRun = false
        projectStatus.firstPassChanged((a) => {
          didRun = true
        })
        projectStatus.firstPassStatus = Complete
        assert(didRun)
      }

      it("for sync") {
        val projectStatus = new ProjectStatus()

        var didRun = false
        projectStatus.syncStatusChanged((a) => {
          didRun = true
        })
        projectStatus.syncStatus = SyncPending
        assert(didRun)
      }

      it("for any") {
        val projectStatus = new ProjectStatus()

        var didRun = false
        projectStatus.statusChanged((a, s) => {
          didRun = true
        })
        projectStatus.firstPassStatus = Complete
        assert(didRun)
      }

    }

    it("will not be called if no actual change") {
      val projectStatus = new ProjectStatus()

      projectStatus.monitoringStatus = NotWatching
      var didRun = false
      projectStatus.monitoringChanged((a) => {
        didRun = true
      })
      projectStatus.monitoringStatus = NotWatching
      assert(!didRun)
    }

  }

  describe("Immutable instances") {
    val projectStatus = new ProjectStatus()
    it("can be created") {
      projectStatus.immutable
    }

    it("changes when parent instance is changed") {
      projectStatus.firstPassStatus = Complete
      assert(projectStatus.immutable.firstPassStatus == Complete)
    }

    it("callbacks on parent can be registered from immutable instance") {

      projectStatus.monitoringStatus = NotWatching
      var didRun = false
      projectStatus.immutable.monitoringChanged((a) => {
        didRun = true
      })
      projectStatus.monitoringStatus = NotWatching
      assert(!didRun)

    }

  }

  it("can output json") {
    val projectStatus = new ProjectStatus()
    val json = projectStatus.immutable.asJson.toString
  }


}
