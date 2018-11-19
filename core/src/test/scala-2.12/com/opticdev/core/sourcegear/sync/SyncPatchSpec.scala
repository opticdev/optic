package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.snapshot.Snapshot
import play.api.libs.json.Json

import scala.concurrent.Await
import scala.concurrent.duration._

class SyncPatchSpec extends AkkaTestFixture("SyncPatchSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String) = new {
    val file = File(filePath)
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val results = syncTestSourceGear.parseFile(file).get
    val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file, results.fileTokenRegistry.exports)
      SyncGraph.getSyncGraph(snapshot)
    }

    def snapshot = Await.result(Snapshot.forSourceGearAndProjectGraph(syncTestSourceGear, project.projectGraphWrapper.projectGraph, actorCluster.parserSupervisorRef, project), 30 seconds)
  }

  it("can calculate valid file patch from diff") {

    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project

    val diff = DiffSyncGraph.calculateDiff(f.snapshot)
    val filePatches = diff.filePatches

    println(filePatches.head.newFileContents)

    assert(filePatches.head.newFileContents === """source('hello') //optic.name = "Hello Model"
                                                  |source('good morning') //optic.name = "Good Morning"
                                                  |source('welcome to') //optic.name = "Welcome To"
                                                  |source('welcome to') //optic.name = "Welcome To"
                                                  |
                                                  |target('hello') //optic.source = "Hello Model" -> optic:synctest/passthrough-transform
                                                  |target('good morning') //optic.source = "Good Morning" -> optic:synctest/passthrough-transform
                                                  |target('not_real') //optic.source = "Not Real" -> optic:synctest/passthrough-transform""".stripMargin)

  }

  it("will work across multiple files") {
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val pgw = ProjectGraphWrapper.empty()
    val resultsA = {
      val file = File("test-examples/resources/example_source/sync/multi_file/A.js")
      val astResults = syncTestSourceGear.parseFile(file).get
      pgw.addFile(astResults.astGraph, file, astResults.fileTokenRegistry.exports)
    }

    val resultsB = {
      val file = File("test-examples/resources/example_source/sync/multi_file/B.js")
      val astResults = syncTestSourceGear.parseFile(file).get
      pgw.addFile(astResults.astGraph, file, astResults.fileTokenRegistry.exports)
    }

    project.stageProjectGraph(pgw.projectGraph)

    val snapshot = Await.result(Snapshot.forSourceGearAndProjectGraph(syncTestSourceGear, project.projectGraphWrapper.projectGraph, actorCluster.parserSupervisorRef, project), 30 seconds)

    val filePatches = DiffSyncGraph.calculateDiff(snapshot).filePatches

    assert(filePatches.map(_.file.nameWithoutExtension).toSet == Set("A", "B"))
  }

}
