package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject

class DiffSyncGraphSpec extends AkkaTestFixture("GraphFunctionsSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  describe("1edge dependencies") {

    val file = File("test-examples/resources/example_source/sync/Sync.js")
    implicit lazy val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    lazy val results = syncTestSourceGear.parseFile(file).get
    lazy val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file)
      SyncGraphFunctions.updateSyncEdges(results.astGraph, ProjectGraphWrapper.empty.projectGraph)
    }

    it("can calculate a valid diff") {
      project.stageProjectGraph(updatedGraphResults.graph)
      DiffSyncGraph.calculateDiff(project)
    }

  }

}
