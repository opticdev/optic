package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.StaticSGProject
import play.api.libs.json.Json

class SyncPatchSpec extends AkkaTestFixture("SyncPatchSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String) = new {
    val file = File(filePath)
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val results = syncTestSourceGear.parseFile(file).get
    val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file)
      SyncGraph.getSyncGraph
    }
  }

  it("can calculate valid file patch from diff") {

    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project

    project.stageProjectGraph(f.updatedGraphResults.syncGraph)
    val diff = DiffSyncGraph.calculateDiff(project)
    val filePatches = diff.filePatches

    assert(filePatches.head.newFileContents === """source('hello') //name: Hello Model
                                                  |source('good morning') //name: Good Morning
                                                  |source('welcome to') //name: Welcome To
                                                  |source('welcome to') //name: Welcome To
                                                  |
                                                  |target('hello') //source: Hello Model -> optic:synctest/passthrough-transform
                                                  |target('good morning') //source: Good Morning -> optic:synctest/passthrough-transform
                                                  |target('not_real') //source: Not Real -> optic:synctest/passthrough-transform""".stripMargin)

  }

  it("will work across multiple files") {
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
    val filePatches = DiffSyncGraph.calculateDiff(project).filePatches

    assert(filePatches.map(_.file.nameWithoutExtension).toSet == Set("A", "B"))
  }

}
