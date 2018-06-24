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
import play.api.libs.json._

class TrainerRouteSpec extends FunSpec with Matchers with ScalatestRouteTest with TestBase {

  val trainerRoute = new TrainerRoute()

  describe("trainer") {

    it("returns training results when valid") {

      val importTrainerValidExample = Trainer("", "es7", "const definedAs = require('pathto')", JsObject(Seq(
        "definedAs" -> JsString("definedAs"),
        "pathto" -> JsString("pathto")
      )))


      val postBody = JsObject(Seq(
        "exampleSnippet" -> JsString(importTrainerValidExample.exampleSnippet),
        "expectedValue" -> JsString(importTrainerValidExample.expectedValue.toString()),
        "languageName" -> JsString(importTrainerValidExample.languageName)
      ))

      Post("/trainer/lens", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
        val response = responseAs[JsObject]
        val expected = JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> importTrainerValidExample.returnAllCandidates.get.asJson))
        assert(response == expected)
      }
    }

  }

  describe("lens test") {

    val importExample ="""
                   |{
                   |      "name": "Using Require",
                   |      "id": "using-require",
                   |      "schema": {},
                   |      "snippet": {
                   |        "language": "es7",
                   |        "block": "let definedAs = require('pathTo')"
                   |      },
                   |      "value": {
                   |        "definedAs": {
                   |          "type": "token",
                   |          "at": {
                   |            "astType": "Identifier",
                   |            "range": {
                   |              "start": 4,
                   |              "end": 13
                   |            }
                   |          }
                   |        },
                   |        "pathTo": {
                   |          "type": "literal",
                   |          "at": {
                   |            "astType": "Literal",
                   |            "range": {
                   |              "start": 24,
                   |              "end": 32
                   |            }
                   |          }
                   |        }
                   |      }
                   |    }
                 """.stripMargin

    val testString = """let definedAs = require('pathTo')"""

    it("returns test results when valid") {

      val postBody = JsObject(Seq(
        "configuration" -> Json.parse(importExample),
        "markdown" -> JsString("Hello world..."),
        "testInput" -> JsString(testString)
      ))

      Post("/trainer/lens/test", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
        val response = responseAs[JsObject]
        val expected = JsObject(Seq("success" -> JsBoolean(true), "value" -> Json.parse("""{"definedAs":"definedAs","pathTo":"pathTo","_variables":{}}""")))
        assert(response == expected)
      }



    }

  }

}
