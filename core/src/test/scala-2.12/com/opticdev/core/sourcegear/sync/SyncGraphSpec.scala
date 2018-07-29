package com.opticdev.core.sourcegear.sync

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.sourcegear.AstDebugLocation
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.sourcegear.snapshot.Snapshot

import scala.concurrent.Await
import scala.concurrent.duration._

class SyncGraphSpec extends AkkaTestFixture("SyncGraphSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String) = new {
    implicit val actorCluster = new ActorCluster(ActorSystem())
    val file = File(filePath)
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val results = {
      val astResults = syncTestSourceGear.parseFile(file).get
      val pgw = ProjectGraphWrapper.empty()
      pgw.addFile(astResults.astGraph, file)
      project.stageProjectGraph(pgw.projectGraph)
      astResults
    }

    def snapshot = Await.result(Snapshot.forSourceGearAndProjectGraph(syncTestSourceGear, project.projectGraphWrapper.projectGraph, actorCluster.parserSupervisorRef, project), 30 seconds)

  }

  def stringFixture(contents: String) = {
    val file = File("test-examples/resources/tmp/example_source/sync/Stub.js")
    file.write(contents)
    fixture(file.pathAsString)
  }

  it("parsed models in ast graph will contain name and source annotations") {
    val f = fixture("test-examples/resources/example_source/sync/Sync.js")

    assert(f.results.modelNodes.exists(_.objectRef.isDefined))
    assert(f.results.modelNodes.exists(_.sourceAnnotation.isDefined))
  }

  def testEdgeForSourceName(syncSubgraph: SyncSubGraph, sourceName: String) = {
    val edges = syncSubgraph.syncGraph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.exists(i=> {
      i.from.value.asInstanceOf[BaseModelNode].objectRef.get.name == sourceName &&
        i.to.value.asInstanceOf[BaseModelNode].sourceAnnotation.get.sourceName == sourceName
    }))
  }

  it("Can add edges from new graph") {
    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project
    val syncSubgraph = SyncGraph.getSyncGraph(f.snapshot)

    val edges = syncSubgraph.syncGraph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.size == 2)
    testEdgeForSourceName(syncSubgraph, "Hello Model")
    testEdgeForSourceName(syncSubgraph, "Good Morning")
  }

  it("Can add across files") {

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

    val snapshot = Await.result(Snapshot.forSourceGearAndProjectGraph(syncTestSourceGear, project.projectGraphWrapper.projectGraph, actorCluster.parserSupervisorRef, project), 30 seconds)

    val syncSubgraph = SyncGraph.getSyncGraph(snapshot)

    val edges = syncSubgraph.syncGraph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.size == 2)
    testEdgeForSourceName(syncSubgraph, "Hello Model")
    testEdgeForSourceName(syncSubgraph, "Good Morning")
  }

  describe("warnings") {
    it("warning raised for orphaned target") {
      val code =
        """
          |source('test') //source: find A Fake One -> optic:test/passthrough-transform
        """.stripMargin

      val f = stringFixture(code)
      implicit val project = f.project
      val syncSubgraph = SyncGraph.getSyncGraph(f.snapshot)
      assert(syncSubgraph.warnings.size == 1)
      assert(syncSubgraph.warnings.head.isInstanceOf[SourceDoesNotExist])
      assert(syncSubgraph.warnings.head.asInstanceOf[SourceDoesNotExist].missingSource == "find A Fake One")
    }

    it("warning raised for duplicate sources") {
      val code =
        """
          |source('test') //name: THIS ONE
          |source('test2') //name: THIS ONE
        """.stripMargin
      val f = stringFixture(code)
      implicit val project = f.project
      val syncSubgraph = SyncGraph.getSyncGraph(f.snapshot)
      assert(syncSubgraph.warnings.size == 1)
      assert(syncSubgraph.sources == 0)
      assert(syncSubgraph.warnings.head.isInstanceOf[DuplicateSourceName])
      assert(syncSubgraph.warnings.head.asInstanceOf[DuplicateSourceName].locations.size == 2)
      assert(syncSubgraph.warnings.head.asInstanceOf[DuplicateSourceName].name == "THIS ONE")
    }

    it("will warn if there is a circular dependency") {
      val f = fixture("test-examples/resources/example_source/sync/CircularSync.js")
      implicit val project = f.project
      val syncSubgraph = SyncGraph.getSyncGraph(f.snapshot)
      assert(syncSubgraph.warnings.head.isInstanceOf[CircularDependency])
      assert(syncSubgraph.warnings.head.asInstanceOf[CircularDependency].location.range == Range(85, 100))
    }
  }

}
