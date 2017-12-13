package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.sdk.descriptions.SchemaId
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager
import org.scalatest.BeforeAndAfterEach
import play.api.libs.json.{JsArray, JsObject, JsString}

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await

class PutUpdateSpec extends AkkaTestFixture("ContextQuerySpec") with ProjectsManagerFixture with BeforeAndAfterEach {

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
      val cq = new ContextQuery(File("test-examples/resources/tmp/test_project/app.js"), Range(35, 37))
      cq.executeToApiResponse
    })


    val result = Await.result(future, 10 seconds)
    println(result.data.toString())
    result.data.as[JsArray].value.head.as[JsObject].value("id").as[JsString].value
  }

  it("can update model") {

    val putUpdate = new PutUpdate(modelId, JsObject(Seq("method" -> JsString("post"), "url" -> JsString("other/url"))))
    val future = putUpdate.execute

    val result = Await.result(future, 3 seconds)

    val newContents = result.contentAsString
    println(newContents)
    assert(newContents.contains("app.post('other/url'"))

  }

  it("can update model and return API request") {
    val putUpdate = new PutUpdate(modelId, JsObject(Seq("method" -> JsString("post"), "url" -> JsString("other/url"))))
    val future = putUpdate.executeToApiResponse

    val result = Await.result(future, 3 seconds)

    println(result.data.as[JsObject])

    assert(result.statusCode == StatusCodes.OK)
    assert(result.data.as[JsObject]
      .value("filesUpdated").as[JsArray]
      .value.exists(_.as[JsString].value.contains("app.js")))

  }


}
