package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.core.Fixture.{AkkaTestFixture, TestBase}
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.data.{FileIsNotWatchedByProjectException, FileNotInProjectException}
import com.opticdev.server.state.ProjectsManager
import com.opticdev.server.storage.ServerStorage
import org.scalatest.{BeforeAndAfterAll, FunSpec}
import play.api.libs.json.{JsArray, JsObject}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Promise}
import scala.concurrent.duration._
class ContextQuerySpec extends AkkaTestFixture("ContextQuerySpec") with TestBase with ProjectsManagerFixture {

  it("finds context for file/range pair") {
    resetScratch
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), None, "test")
      cq.execute
    })

    val result = Await.result(future, 20 seconds)

    assert(result.modelNodes.size == 1)
    assert(result.modelNodes.head.schemaId == SchemaRef.fromString("optic:rest@0.1.0/route").get)
  }

  it("returns an empty vector if nothing is found") {
    resetScratch
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(400, 450), None, "test")
      cq.execute
    })

    val result = Await.result(future, 20 seconds)

    assert(result.modelNodes.isEmpty)
  }

  it("returns an empty vector if parse error") {
    resetScratch
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/invalid.js"), Range(0, 3), None, "test")
      cq.execute
    })

    val result = Await.result(future, 20 seconds)

    assert(result.modelNodes.isEmpty)
  }

  it("will fail if project does not watch queried file") {
    resetScratch
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/README"), Range(400, 450), None, "test")
      cq.execute
    })

    assertThrows[FileIsNotWatchedByProjectException] {
      Await.result(future, 10 seconds)
    }
  }

  it("will fail if project doesn't exist") {
    resetScratch
    implicit val projectsManager = projectsManagerWithStorage(ServerStorage(Map("test" -> "test-examples/resources/tmp/test_project")))
    val cq = new ContextQuery(File("not/real/file"), Range(12, 35), None, "test")
    cq.execute.onComplete(i=> {
      assert(i.isFailure)
      assert(i.failed.get.isInstanceOf[FileNotInProjectException])
    })
  }

  describe("Json Output") {

    it("converts valid responses to a JSON array") {

      val future = instanceWatchingTestProject.flatMap(pm=> {
        implicit val projectsManager: ProjectsManager = pm
        val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), None, "test")
        cq.execute
      })

      val result = Await.result(future, 10 seconds)
      assert(result.modelNodes.size == 1)

    }

  }

  it("can work with a staged output") {
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), Some("var me = you"), "test")
      cq.execute
    })

    val result = Await.result(future, 10 seconds)
    assert(result.modelNodes.isEmpty)
  }

}
