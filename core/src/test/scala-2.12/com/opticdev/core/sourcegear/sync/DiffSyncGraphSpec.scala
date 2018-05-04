package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import play.api.libs.json.Json

class DiffSyncGraphSpec extends AkkaTestFixture("DiffSyncGraphSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def checkReplace(diff: SyncDiff, before: String, after: String) = {
    val asReplace = diff.asInstanceOf[Replace]
    assert(asReplace.before == Json.parse(before))
    assert(asReplace.after == Json.parse(after))
  }

  def fixture(filePath: String) = new {
    val file = File(filePath)
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val results = syncTestSourceGear.parseFile(file).get
    val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file)
      SyncGraph.getSyncGraph
    }
  }

  it("can calculate a valid diff for direct dependencies (1 edge)") {

    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project

    project.stageProjectGraph(f.updatedGraphResults.graph)
    val diff = DiffSyncGraph.calculateDiff(project)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 2)
    checkReplace(diff.changes(0), """{"value":"vietnam"}""", """{"value":"good morning"}""")
    checkReplace(diff.changes(1), """{"value":"world"}""", """{"value":"hello"}""")
  }

  it("can calculate a valid diff when no changes") {

    val f = fixture("test-examples/resources/example_source/sync/NoSyncNeeded.js")
    implicit val project = f.project

    project.stageProjectGraph(f.updatedGraphResults.graph)
    val diff = DiffSyncGraph.calculateDiff(project, includeNoChange = true)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 1)
    assert(diff.changes(0).isInstanceOf[NoChange])
  }

  it("can calculate a valid diff for dependency tree") {
    val f = fixture("test-examples/resources/example_source/sync/TreeSync.js")
    implicit val project = f.project

    project.stageProjectGraph(f.updatedGraphResults.graph)
    val diff = DiffSyncGraph.calculateDiff(project)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 3)
    checkReplace(diff.changes(0), """{"value":"b"}""", """{"value":"a"}""")
    checkReplace(diff.changes(1), """{"value":"c"}""", """{"value":"a"}""")
    checkReplace(diff.changes(2), """{"value":"d"}""", """{"value":"a"}""")
  }

  it("can calculate a valid diff for branched dependency tree") {
    val f = fixture("test-examples/resources/example_source/sync/BranchedTreeSync.js")
    implicit val project = f.project

    project.stageProjectGraph(f.updatedGraphResults.graph)
    val diff = DiffSyncGraph.calculateDiff(project)
    assert(!diff.containsErrors)
    assert(diff.changes.size == 4)
    checkReplace(diff.changes(0), """{"value":"0"}""", """{"value":"a"}""")
    checkReplace(diff.changes(1), """{"value":"b"}""", """{"value":"a"}""")
    checkReplace(diff.changes(2), """{"value":"b"}""", """{"value":"a"}""")
    checkReplace(diff.changes(3), """{"value":"b"}""", """{"value":"a"}""")
  }

  it("can do a diff across multiple files") {
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val pgw = ProjectGraphWrapper.empty()
    val resultsA = {
      val file = File("test-examples/resources/example_source/sync/multi_file/A.js")
      val astResults = syncTestSourceGear.parseFile(file).get
      pgw.addFile(astResults.astGraph, file)
    }

    val resultsB = {
      val file = File("test-examples/resources/example_source/sync/multi_file/B.js")
      val astResults = syncTestSourceGear.parseFile(file).get
      pgw.addFile(astResults.astGraph, file)
    }

    project.stageProjectGraph(pgw.projectGraph)

    val diff = DiffSyncGraph.calculateDiff(project)
    assert(diff.changes.size == 2)
    checkReplace(diff.changes(0), """{"value":"vietnam"}""", """{"value":"good morning"}""")
    checkReplace(diff.changes(1), """{"value":"world"}""", """{"value":"hello"}""")
  }

  describe("error handling") {

    it("will handle errors gracefully") {
      val f = fixture("test-examples/resources/example_source/sync/InvalidSync.js")
      implicit val project = f.project

      project.stageProjectGraph(f.updatedGraphResults.graph)
      val diff = DiffSyncGraph.calculateDiff(project)
      assert(diff.containsErrors)
      checkReplace(diff.changes(0), """{"value":"world"}""", """{"value":"hello"}""")
      assert(diff.changes(1).isInstanceOf[ErrorEvaluating])
    }

    it("will handle errors for a tree gracefully") {
      val f = fixture("test-examples/resources/example_source/sync/InvalidTreeSync.js")
      implicit val project = f.project
      project.stageProjectGraph(f.updatedGraphResults.graph)
      val diff = DiffSyncGraph.calculateDiff(project)
      assert(diff.containsErrors)
      checkReplace(diff.changes(0), """{"value":"b"}""", """{"value":"a"}""")
      assert(diff.changes(1).isInstanceOf[ErrorEvaluating])  //gets skipped, then sync continues at the next leaf
      checkReplace(diff.changes(2), """{"value":"d"}""", """{"value":"c"}""")
      checkReplace(diff.changes(3), """{"value":"e"}""", """{"value":"c"}""")
    }

  }

}
