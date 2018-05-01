package com.opticdev.core.sourcegear.sync

import better.files.File
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.StaticSGProject

class GraphFunctionsSpec extends AkkaTestFixture("GraphFunctionsSpec") with GearUtils {

  lazy val syncTestSourceGear = sourceGearFromDescription("test-examples/resources/example_packages/synctest.json")
  implicit lazy val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), syncTestSourceGear)
  lazy val results = syncTestSourceGear.parseFile(File("test-examples/resources/example_source/sync/Sync.js")).get


  def astGraphFromString(string: String) = syncTestSourceGear.parseString(string).get.astGraph

  it("parsed models in ast graph will contain name and source annotations") {
    assert(results.modelNodes.exists(_.objectRef.isDefined))
    assert(results.modelNodes.exists(_.sourceAnnotation.isDefined))
  }

  def testEdgeForSourceName(updatedGraphResults: UpdateResults, sourceName: String) = {
    val edges = updatedGraphResults.graph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.exists(i=> {
      i.from.value.asInstanceOf[BaseModelNode].objectRef.get.name == sourceName &&
        i.to.value.asInstanceOf[BaseModelNode].sourceAnnotation.get.sourceName == sourceName
    }))
  }

  it("Can add edges from new graph") {
    val updatedGraphResults = GraphFunctions.updateSyncEdges(results.astGraph, ProjectGraphWrapper.empty.projectGraph)

    val edges = updatedGraphResults.graph.edges.filter(_.value.label.isInstanceOf[DerivedFrom])
    assert(edges.size == 2)
    testEdgeForSourceName(updatedGraphResults, "Hello Model")
    testEdgeForSourceName(updatedGraphResults, "Good Morning")
  }



  describe("warnings") {
    it("warning raised for orphaned target") {
      val code =
        """
          |source('test') //source: find A Fake One
        """.stripMargin
      val updatedGraphResults = GraphFunctions.updateSyncEdges(astGraphFromString(code), ProjectGraphWrapper.empty.projectGraph)
      assert(updatedGraphResults.warnings.size == 1)
      assert(updatedGraphResults.warnings.head == SourceDoesNotExist("find A Fake One", defaultAstDebugLocation))
    }

    it("warning raised for duplicate sources") {
      val code =
        """
          |source('test') //name: THIS ONE
          |source('test2') //name: THIS ONE
        """.stripMargin
      val updatedGraphResults = GraphFunctions.updateSyncEdges(astGraphFromString(code), ProjectGraphWrapper.empty.projectGraph)
      assert(updatedGraphResults.warnings.size == 1)
      assert(updatedGraphResults.sources == 0)
      assert(updatedGraphResults.warnings.head == DuplicateSourceName("THIS ONE", Seq()))
    }

    it("will warn if there is a circular dependency") {
      val astGraph = astGraphFromString(File("test-examples/resources/example_source/sync/CircularSync.js").contentAsString)
      val updatedGraphResults = GraphFunctions.updateSyncEdges(astGraph, ProjectGraphWrapper.empty.projectGraph)

      assert(updatedGraphResults.warnings.head == CircularDependency("Third", defaultAstDebugLocation))

    }
  }

}
