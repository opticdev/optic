package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject

trait SyncFixture extends TestBase with GearUtils {
  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String)(implicit actorCluster: ActorCluster) = new {
    val file = File(filePath)
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val results = syncTestSourceGear.parseFile(file).get
    val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file)
      SyncGraph.getSyncGraph
    }
  }

}
