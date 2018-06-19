package com.opticdev.server.http.routes

import akka.actor.ActorSystem
import akka.http.scaladsl.model._
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
import play.api.libs.json.{JsArray, JsBoolean, JsObject, JsString}

class TrainerRouteSpec extends FunSpec with Matchers with ScalatestRouteTest with TestBase {

  val trainerRoute = new TrainerRoute()

  it("returns training results when valid") {

    val importTrainerValidExample = Trainer("", "es7", "const definedAs = require('pathto')", JsObject(Seq(
      "definedAs" -> JsString("definedAs"),
      "pathto" -> JsString("pathto")
    )))


    val postBody = JsObject(Seq(
      "exampleSnippet" -> JsString(importTrainerValidExample.exampleSnippet),
      "expectedValue" -> JsString(importTrainerValidExample.expectedValue.toString()),
      "languageName" -> JsString(importTrainerValidExample.languageName)
      )
    )




    Post("/trainer/lens", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
      val response = responseAs[JsObject]
      val expected = JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> importTrainerValidExample.returnAllCandidates.get.asJson))
      println(expected)
      assert(response == expected)
    }
  }

}
