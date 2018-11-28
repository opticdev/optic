package com.opticdev.arrow.changes

import com.opticdev.core.Fixture.TestBase
import com.opticdev.opm.TestPackageProviders
import play.api.libs.json.Json
import ExampleChanges._
import better.files.File
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.{SGConfig, SGConstructor}
import com.opticdev.common.graph.CommonAstNode
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach}

import scala.concurrent.duration._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global

class ChangesEvaluationSpec extends TestBase with TestPackageProviders with BeforeAndAfterEach {

  implicit val nodeKeyStore = new NodeKeyStore
  implicit val autorefreshes : Boolean = false

  override def beforeEach(): Unit = {
    resetScratch
    super.beforeEach()
  }

  describe("Insert Model") {

    it("can evaluate insert model operations") {
      val (changeGroup, sourcegear, expectedChange) = simpleModelInsert
      val results = changeGroup.evaluate(sourcegear)

      assert(results.isSuccess)
      assert(results.stagedFiles.head._2.text === expectedChange)
    }

    it("can write changes to disk") {
      val (changeGroup, sourcegear, expectedChange) = simpleModelInsert
      val results = changeGroup.evaluateAndWrite(sourcegear)
      File("test-examples/resources/tmp/test_project/app.js").contentAsString == expectedChange
    }

  }

  describe("Transformations") {

    it("Runs Transformation") {
      val (changeGroup, sourcegear, expectedChange) = transformModelToRoute
      val results = changeGroup.evaluateAndWrite(sourcegear)

      val actual = results.get.stagedFiles.head._2.text

      println(results.get.stagedFiles.head._2.text)


      assert(results.get.stagedFiles.head._2.text == expectedChange)
    }

    //Not longer needed for the current use cases.
//    it("Runs Nested Transformation") {
//      val (changeGroup, sourcegear, expectedChange) = nestedTransformModelToRoute
//      val results = changeGroup.evaluateAndWrite(sourcegear)
//
//      assert(results.get.stagedFiles.head._2.text == expectedChange)
//    }
//
//    it("Runs mutation transformation") {
//      val (changeGroup, sourcegear, project, expectedChange) = mutationTransformationAnyRouteToPostRoute
//      val file = File("test-examples/resources/tmp/test_project/nested/testMutationTransform.js")
//      val parsed = project.projectSourcegear.parseFile(file)(project).get
//      project.projectGraphWrapper.addFile(parsed.astGraph, file)
//      val graph = project.projectGraphWrapper.subgraphForFile(file)
//
//      val inputLinkedModelNode = parsed.modelNodes.find(_.lensRef.id == "route").get.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parsed.astGraph)
//
//      nodeKeyStore.assignId(file, "test123", inputLinkedModelNode)
//
//      val results = changeGroup.evaluateAndWrite(sourcegear, Some(project))
//
//      val a = results.get.stagedFiles.head._2.text
//
//      assert(results.get.stagedFiles.head._2.text == expectedChange)
//    }
//
//    it("Runs a multi transformation") {
//      val (changeGroup, sourcegear, project, expectedChange) = multiTransformation
//      val file = File("test-examples/resources/tmp/test_project/nested/testMutationTransform.js")
//      val parsed = project.projectSourcegear.parseFile(file)(project).get
//      project.projectGraphWrapper.addFile(parsed.astGraph, file)
//      val graph = project.projectGraphWrapper.subgraphForFile(file)
//
//      val inputLinkedModelNode = parsed.modelNodes.find(_.lensRef.id == "route").get.asInstanceOf[ModelNode].resolveInGraph[CommonAstNode](parsed.astGraph)
//
//      nodeKeyStore.assignId(file, "test123", inputLinkedModelNode)
//
//      val results = changeGroup.evaluateAndWrite(sourcegear, Some(project))
//
//      assert(results.get.stagedFiles.head._2.text == expectedChange)
//    }
//
//    it("RunsTransformation and adds to another file which does not exist") {
//      val (changeGroup, sourcegear, project, expectedChange) = transformAndAddToAnotherFile
//      val results = changeGroup.evaluateAndWrite(sourcegear, Some(project))
//
//      assert(results.isSuccess)
//      assert(results.get.stagedFiles.head._1.exists)
//      assert(results.get.stagedFiles.head._2.text == expectedChange)
//
//    }

  }

  describe("File Contents Updates") {
    it("Updates file when valid") {
      val newContents = "let test = 1234"
      val changeGroup = ChangeGroup(FileContentsUpdate(File("test-examples/resources/tmp/test_project/nested/firstFile.js"), "let me = \"you\"", newContents))
      val results = changeGroup.evaluateAndWrite(sourceGearContext.sourceGear)
      assert(results.isSuccess)
      assert(results.get.stagedFiles.size == 1)
      assert(results.get.stagedFiles.head._2.text == newContents)
    }

    it("Fails to update if current value is different") {
      val newContents = "let test = 1234"
      val changeGroup = ChangeGroup(FileContentsUpdate(File("test-examples/resources/tmp/test_project/nested/firstFile.js"), "let different = \"you\"", newContents))
      val results = changeGroup.evaluateAndWrite(sourceGearContext.sourceGear)
      assert(results.isFailure)
    }

    it("Fails to update if file does not exist") {
      val newContents = "let test = 1234"
      val changeGroup = ChangeGroup(FileContentsUpdate(File("test-examples/resources/tmp/test_project/nested/not-real-file.js"), "let different = \"you\"", newContents))
      val results = changeGroup.evaluateAndWrite(sourceGearContext.sourceGear)
      assert(results.isFailure)
    }

  }

}
