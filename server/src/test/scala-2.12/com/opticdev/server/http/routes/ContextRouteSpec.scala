package com.opticdev.server.http.routes

import java.net.URLEncoder

import akka.actor.ActorSystem
import akka.http.scaladsl.server.MissingQueryParamRejection
import akka.http.scaladsl.testkit.ScalatestRouteTest
import better.files.File
import com.opticdev.core.Fixture.TestBase
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.state.ProjectsManager
import org.scalatest.concurrent.Eventually
import org.scalatest.time.{Seconds, Span}
import org.scalatest.{FunSpec, Matchers}
import play.api.libs.json.{JsArray, JsObject, JsString}

import scala.concurrent.duration._
import scala.concurrent.Await

class ContextRouteSpec extends FunSpec with Matchers with ScalatestRouteTest with Eventually with TestBase with ProjectsManagerFixture {

  installProviders
  lazy implicit val projectsManager = Await.result(instanceWatchingTestProject, 10 seconds)
  lazy val contextRoute = new ContextRoute()

  it("returns context once project has loaded for valid queries") {
    val url = s"/context?file=${URLEncoder.encode(getCurrentDirectory + "/test-examples/resources/tmp/test_project/app.js", "UTF-8")}&start=${31}&end=${32}"
    Get(url) ~> contextRoute.route ~> check {
      assert(responseAs[JsArray].toString() ==
        "[{\"id\":null,\"schemaId\":\"optic:rest/route\",\"astLocation\":{\"type\":\"ExpressionStatement:Javascript\",\"start\":31,\"end\":92},\"value\":{\"method\":\"get\",\"url\":\"user/:id\"}}]")
    }
  }

  it("fails with error when file does not exist") {
    val url = s"/context?file=${URLEncoder.encode(getCurrentDirectory + "/test-examples/resources/tmp/test_project/notReal.js", "UTF-8")}&start=${31}&end=${32}"
    Get(url) ~> contextRoute.route ~> check {
      assert(response.status.isFailure())
      assert(responseAs[JsObject].value("error").as[JsString].value.contains("test-examples/resources/tmp/test_project/notReal.js is not being watched by its optic project"))
    }
  }


  it("fails when query is not valid") {
    val url = s"/context?fileeee=2"
    Get(url) ~> contextRoute.route ~> check {
      assert(rejection == MissingQueryParamRejection("file"))
    }
  }

}
