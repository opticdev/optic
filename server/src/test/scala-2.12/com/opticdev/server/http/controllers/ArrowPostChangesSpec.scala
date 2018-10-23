package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.arrow.changes.{ChangeGroup, ExampleChanges}
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.opm.TestPackageProviders
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.Await

class ArrowPostChangesSpec extends AkkaTestFixture("ArrowPostChangesSpec") with ProjectsManagerFixture with TestPackageProviders {

  override def beforeAll(): Unit = {
    resetScratch
    super.beforeAll()
  }

  def runChangeQuery(projectName: String, changes: ChangeGroup, otherOperation: (OpticProject) => Unit = (p)=> {}) = {
    instanceWatchingTestProject.flatMap(pm => {
      implicit val projectsManager: ProjectsManager = pm
      val aq = new ArrowPostChanges(projectsManager.lookupProject(projectName).toOption, changes)
      val project = pm.lookupProject(projectName).get
      otherOperation(project)
      aq.execute
    })
  }

  it("can run a query") {

    val result = Await.result(runChangeQuery("Unnamed Project", ExampleChanges.simpleModelInsert._1), 10 seconds)

    assert(result.isSuccess)
    assert(result.stagedFiles.size == 1)
    assert(result.stagedFiles.head._2.text == ExampleChanges.simpleModelInsert._3)

  }

  it("can run a query on staged contents") {

    val (changeGroup, sourcegear, stagedContent, expectedChange) = ExampleChanges.insertFromSearch

    val result = Await.result(runChangeQuery("Unnamed Project", changeGroup, (project)=> {
      project.stageFileContents(File("test-examples/resources/tmp/test_project/app.js"), stagedContent)
    }), 10 seconds)

    assert(result.isSuccess)
    assert(result.stagedFiles.size == 1)
    assert(result.stagedFiles.head._2.text == expectedChange)


  }


}
