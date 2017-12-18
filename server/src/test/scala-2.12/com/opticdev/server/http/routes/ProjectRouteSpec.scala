package com.opticdev.server.http.routes

import akka.actor.ActorSystem
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.testkit.ScalatestRouteTest
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.server.http.routes.ProjectRoute
import com.opticdev.server.state.ProjectsManager
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import org.scalatest.{FunSpec, Matchers}
import play.api.libs.json.{JsArray, JsObject}

class ProjectRouteSpec extends FunSpec with Matchers with ScalatestRouteTest with TestBase {

  implicit val logToCli = false
  implicit val actorCluster = new ActorCluster(ActorSystem("ProjectRouteTest"))
  val testProject = new StaticSGProject("TestProject", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), SourceGear.default)
  implicit val projectsManager = new ProjectsManager
  projectsManager.loadProject(testProject)

  val projectRoute = new ProjectRoute()

  it("return a list of projects at GET /projects") {
    Get("/projects") ~> projectRoute.route ~> check {
      assert(responseAs[JsArray] == JsArray(Seq(testProject.projectInfo.asJson)))
    }
  }

  it("returns a project at GET /projects/{name}") {
    val name = testProject.name
    Get("/projects/"+name) ~> projectRoute.route ~> check {
      assert(responseAs[JsObject] == testProject.projectInfo.asJson)
    }
  }

  it("returns a 404 Not found for GET /projects/{name} when does not exist") {
    Get("/projects/notREAL!") ~> projectRoute.route ~> check {
      assert(response.status == StatusCodes.NotFound)
    }
  }

  it("can return all models in a project") {
    val name = testProject.name
    Get("/projects/"+name+"/models/Imports") ~> projectRoute.route ~> check {
      assert(responseAs[JsArray] == JsArray())
    }
  }

//  it("can return a schema by id") {
//    val name = testProject.name
//  }

}
