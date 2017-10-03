package server.routes

import Fixture.TestBase
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.testkit.ScalatestRouteTest
import better.files.File
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.server.http.routes.ProjectsRoute
import com.opticdev.server.http.state.StateManager
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import org.scalatest.{FunSpec, Matchers}
import play.api.libs.json.{JsArray, JsObject}

class ProjectRouteTest extends FunSpec with Matchers with ScalatestRouteTest with TestBase {

  describe("The projects route should") {

    val testProject = new Project("TestProject", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"))
    implicit val stateManager = new StateManager(Set(testProject))

    val projectRoute = new ProjectsRoute()

    it("return a list of projects at GET /projects") {
      Get("/projects") ~> projectRoute.route ~> check {
        assert(responseAs[JsArray] == JsArray(Seq(testProject.asJson)))
      }
    }

    it("returns a project at GET /projects/{name}") {
      val name = testProject.name
      Get("/projects/"+name) ~> projectRoute.route ~> check {
        assert(responseAs[JsObject] == testProject.asJson)
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

  }

}
