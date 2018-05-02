package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.sourcegear.AstDebugLocation
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject

class SyncGraphFunctionsSpec extends AkkaTestFixture("GraphFunctionsSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")

  def fixture(filePath: String) = new {
    val file = File(filePath)
    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
    val results = {
      val astResults = syncTestSourceGear.parseFile(file).get
      val pgw = ProjectGraphWrapper.empty()
      pgw.addFile(astResults.astGraph, file)
      project.stageProjectGraph(pgw.projectGraph)
      astResults
    }
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

  def testEdgeForSourceName(updatedGraphResults: UpdateResults, sourceName: String) = {
    val edges = updatedGraphResults.graph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.exists(i=> {
      i.from.value.asInstanceOf[BaseModelNode].objectRef.get.name == sourceName &&
        i.to.value.asInstanceOf[BaseModelNode].sourceAnnotation.get.sourceName == sourceName
    }))
  }

  it("Can add edges from new graph") {
    val f = fixture("test-examples/resources/example_source/sync/Sync.js")
    implicit val project = f.project
    val updatedGraphResults = SyncGraphFunctions.updateSyncEdges(f.results.astGraph)

    val edges = updatedGraphResults.graph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.size == 2)
    testEdgeForSourceName(updatedGraphResults, "Hello Model")
    testEdgeForSourceName(updatedGraphResults, "Good Morning")
  }

  describe("warnings") {
    it("warning raised for orphaned target") {
      val code =
        """
          |source('test') //source: find A Fake One -> optic:test/passthrough-transform
        """.stripMargin

      val f = stringFixture(code)
      implicit val project = f.project
      val updatedGraphResults = SyncGraphFunctions.updateSyncEdges(f.results.astGraph)
      assert(updatedGraphResults.warnings.size == 1)
      assert(updatedGraphResults.warnings.head.isInstanceOf[SourceDoesNotExist])
      assert(updatedGraphResults.warnings.head.asInstanceOf[SourceDoesNotExist].missingSource == "find A Fake One")
    }

    it("warning raised for duplicate sources") {
      val code =
        """
          |source('test') //name: THIS ONE
          |source('test2') //name: THIS ONE
        """.stripMargin
      val f = stringFixture(code)
      implicit val project = f.project
      val updatedGraphResults = SyncGraphFunctions.updateSyncEdges(f.results.astGraph)
      assert(updatedGraphResults.warnings.size == 1)
      assert(updatedGraphResults.sources == 0)
      assert(updatedGraphResults.warnings.head.isInstanceOf[DuplicateSourceName])
      assert(updatedGraphResults.warnings.head.asInstanceOf[DuplicateSourceName].locations.size == 2)
      assert(updatedGraphResults.warnings.head.asInstanceOf[DuplicateSourceName].name == "THIS ONE")
    }

    it("will warn if there is a circular dependency") {
      val f = fixture("test-examples/resources/example_source/sync/CircularSync.js")
      implicit val project = f.project
      val updatedGraphResults = SyncGraphFunctions.updateSyncEdges(f.results.astGraph)
      assert(updatedGraphResults.warnings.head.isInstanceOf[CircularDependency])
      assert(updatedGraphResults.warnings.head.asInstanceOf[CircularDependency].location.range == Range(171, 186))

    }
  }

}
