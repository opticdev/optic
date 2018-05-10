package com.opticdev.core.sourcegear.sync

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject

trait SyncFixture extends TestBase with GearUtils {
  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String) = new {
    val file = File(filePath)
    implicit val actorCluster: ActorCluster = new ActorCluster(ActorSystem())
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/"), syncTestSourceGear)
    val results = syncTestSourceGear.parseFile(file).get
    val updatedGraphResults = {
      project.projectGraphWrapper.addFile(results.astGraph, file)
      SyncGraph.getSyncGraph(project.projectGraphWrapper.projectGraph)
    }
  }

}
