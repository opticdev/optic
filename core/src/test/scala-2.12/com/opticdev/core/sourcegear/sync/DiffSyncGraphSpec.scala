package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import play.api.libs.json.Json

class DiffSyncGraphSpec extends AkkaTestFixture("GraphFunctionsSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  describe("1edge dependencies") {

    val file = File("test-examples/resources/example_source/sync/Sync.js")
    implicit lazy val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    lazy val results = syncTestSourceGear.parseFile(file).get
    lazy val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file)
      SyncGraphFunctions.updateSyncEdges(results.astGraph, project.projectGraphWrapper.projectGraph)
    }

    def checkReplace(diff: SyncDiff, before: String, after: String) = {
      val asReplace = diff.asInstanceOf[Replace]
      assert(asReplace.before == Json.parse(before))
      assert(asReplace.after == Json.parse(after))
    }

    it("can calculate a valid diff") {
      project.stageProjectGraph(updatedGraphResults.graph)
      val diff = DiffSyncGraph.calculateDiff(project)
      assert(!diff.containsErrors)
      assert(diff.changes.size == 2)
      checkReplace(diff.changes(0), """{"value":"vietnam"}""", """{"value":"good morning"}""")
      checkReplace(diff.changes(1), """{"value":"world"}""", """{"value":"hello"}""")
    }

  }

}
