package com.opticdev.server.http.routes
import akka.http.scaladsl.model.{ContentType, HttpEntity, MediaTypes}
import akka.http.scaladsl.testkit.ScalatestRouteTest
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.StaticSGProject
import com.opticdev.core.trainer.Trainer
import com.opticdev.server.state.ProjectsManager
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import org.scalatest.{FunSpec, Matchers}
import play.api.libs.json._

class SdkBridgeRouteSpec extends FunSpec with Matchers with ScalatestRouteTest with TestBase {

  val trainerRoute = new SdkBridgeRoute()

  describe("trainer") {

    it("returns training results when valid") {

      val importTrainerValidExample = Trainer("es7", "const definedAs = require('pathto')")

      val postBody = JsObject(Seq(
        "exampleSnippet" -> JsString(importTrainerValidExample.exampleSnippet),
        "languageName" -> JsString(importTrainerValidExample.languageName)
      ))

      Post("/sdk-bridge/lens", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
        val response = responseAs[JsObject]
        val expected = JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> importTrainerValidExample.returnAllCandidates.get.asJson))
        assert(response == expected)
      }

    }

  }

}
