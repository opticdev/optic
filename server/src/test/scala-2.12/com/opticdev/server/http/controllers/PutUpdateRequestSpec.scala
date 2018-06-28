package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.arrow.changes.evaluation.BatchedChanges
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.common.SchemaRef
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager
import org.scalatest.BeforeAndAfterEach
import play.api.libs.json.{JsArray, JsObject, JsString}

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await
import scala.util.Try

class PutUpdateRequestSpec extends AkkaTestFixture("PutUpdateRequest") with ProjectsManagerFixture with BeforeAndAfterEach {

  override def beforeAll(): Unit = {
    resetScratch
    super.beforeAll()
  }

  override def beforeEach() = {
    resetScratch
  }

  implicit var projectsManager : ProjectsManager = null

  lazy val modelId : String = {

    val future = instanceWatchingTestProject.flatMap(pm=> {
      projectsManager = pm
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37), None, "test")
      cq.execute
    })


    val result = Await.result(future, 1 minute)
    import com.opticdev.server.data.ModelNodeJsonImplicits._
    (result.modelNodes.head.asJson() \ "id").get.as[JsString].value
  }

  it("can update model") {

    val putUpdate = new PutUpdateRequest(modelId, JsObject(Seq("method" -> JsString("post"), "url" -> JsString("other/url"))), "test", "Unnamed Project")
    val future = putUpdate.execute

    val result = Await.result(future, 3 seconds).asInstanceOf[BatchedChanges]

    val newContents = result.stagedFiles.head._2.text
    println(newContents)
    assert(newContents.contains("app.post('other/url'"))

  }

  it("can update model and return API request") {
    val putUpdate = new PutUpdateRequest(modelId, JsObject(Seq("method" -> JsString("post"), "url" -> JsString("other/url"))), "test", "Unnamed Project")
    val future = putUpdate.execute
    val result = Await.result(future, 3 seconds).asInstanceOf[BatchedChanges]

    assert(result.stagedFiles.size == 1)

  }


}
