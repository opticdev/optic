package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.opm.TestPackageProviders
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.data.{FileIsNotWatchedByProjectException, FileNotInProjectException}
import com.opticdev.server.state.ProjectsManager
import com.opticdev.server.storage.ServerStorage
import org.scalatest.{BeforeAndAfterAll, FunSpec}
import play.api.libs.json.JsArray

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Promise}
import scala.concurrent.duration._
class ContextQuerySpec extends AkkaTestFixture("ContextQuerySpec") with ProjectsManagerFixture {

  override def beforeAll(): Unit = {
    resetScratch
    super.beforeAll()
  }

  it("finds context for file/range pair") {

    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), None)
      cq.execute
    })

    val result = Await.result(future, 10 seconds)

    assert(result.size == 1)
    assert(result.head.schemaId == SchemaRef.fromString("optic:rest@0.1.0/route").get)
  }

  it("returns an empty vector if nothing is found") {
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(400, 450), None)
      cq.execute
    })

    val result = Await.result(future, 10 seconds)

    assert(result.isEmpty)
  }

  it("will fail if project does not watch queried file") {
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/README"), Range(400, 450), None)
      cq.execute
    })

    assertThrows[FileIsNotWatchedByProjectException] {
      Await.result(future, 10 seconds)
    }
  }

  it("will fail if project doesn't exist") {
    implicit val projectsManager = projectsManagerWithStorage(ServerStorage(Map("test" -> "test-examples/resources/tmp/test_project")))
    val cq = new ContextQuery(File("not/real/file"), Range(12, 35), None)
    cq.execute.onComplete(i=> {
      assert(i.isFailure)
      assert(i.failed.get.isInstanceOf[FileNotInProjectException])
    })
  }

  describe("Json Output") {

    it("converts valid responses to a JSON array") {

      val future = instanceWatchingTestProject.flatMap(pm=> {
        implicit val projectsManager: ProjectsManager = pm
        val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), None)
        cq.executeToApiResponse
      })

      val result = Await.result(future, 10 seconds)
      assert(result.statusCode == StatusCodes.OK)
      assert(result.data.asInstanceOf[JsArray].value.size == 1)

    }

    it("converts exceptions into an error object") {
      implicit val projectsManager = projectsManagerWithStorage(ServerStorage(Map("test" -> "test-examples/resources/tmp/test_project")))
      val cq = new ContextQuery(File("not/real/file"), Range(12, 35), None)
      val future = cq.executeToApiResponse

      val result = Await.result(future, 10 seconds)

      assert(result.statusCode == StatusCodes.NotFound)

    }

  }

  it("can work with a staged output") {
    val future = instanceWatchingTestProject.flatMap(pm=> {
      implicit val projectsManager: ProjectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), Some("var me = you"))
      cq.executeToApiResponse
    })

    val result = Await.result(future, 10 seconds)
    assert(result.statusCode == StatusCodes.OK)
    assert(result.data.asInstanceOf[JsArray].value.isEmpty)
  }

}
