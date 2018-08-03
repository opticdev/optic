package com.opticdev.core.sourcegear.sync

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.compiler.stages.MultiNodeFixture
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.SerializeProjectGraph
import com.opticdev.core.sourcegear.graph.SerializeProjectGraph.SavedObject
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.snapshot.Snapshot
import play.api.libs.json.{JsObject, JsString}

import scala.concurrent.Await
import scala.concurrent.duration._
trait SyncFixture extends TestBase with GearUtils {
  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String) = new {
    val file = File(filePath)
    implicit val actorCluster: ActorCluster = new ActorCluster(ActorSystem())
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/"), syncTestSourceGear)
    val results = syncTestSourceGear.parseFile(file).get

    project.projectGraphWrapper.addProjectSubGraph(connectedGraph)

    project.projectGraphWrapper.addFile(results.astGraph, file)
    val snapshot = {
      Await.result(Snapshot.forSourceGearAndProjectGraph(syncTestSourceGear, project.projectGraphWrapper.projectGraph, actorCluster.parserSupervisorRef, project), 30 seconds)
    }
  }

  def multiNodeSyncFixture(filePath: String) = new {
    val sourceGear = MultiNodeFixture.endToEndFixture.sourcegear

    val file = File(filePath)
    implicit val actorCluster: ActorCluster = new ActorCluster(ActorSystem())
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/"), sourceGear)
    val results = sourceGear.parseFile(file).get
    project.projectGraphWrapper.addFile(results.astGraph, file)
    val snapshot = {
      Await.result(Snapshot.forSourceGearAndProjectGraph(sourceGear, project.projectGraphWrapper.projectGraph, actorCluster.parserSupervisorRef, project), 30 seconds)
    }
  }


  def connectedGraph = {
    SerializeProjectGraph.projectGraphFrom(Set(
      SavedObject("TestA", JsObject(Seq("value" -> JsString("fromForeignProject"))), syncTestSourceGear.schemas.head.schemaRef)
    ), "Foreign Project")
  }

}
