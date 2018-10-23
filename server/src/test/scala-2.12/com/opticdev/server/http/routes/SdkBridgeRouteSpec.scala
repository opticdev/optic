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
        "snippet" -> JsString(importTrainerValidExample.exampleSnippet),
        "languageName" -> JsString(importTrainerValidExample.languageName)
      ))

      Post("/sdk-bridge/lens", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
        val response = responseAs[JsObject]
        val expected = JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> importTrainerValidExample.returnAllCandidates.get.asJson))
        assert(response == expected)
      }

    }

  }

  describe("tester") {


    val importExample =
      File("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").contentAsString

    describe("generate") {
      it("can generate code when valid") {
        val postBody = JsObject(Seq(
          "packageJson" -> Json.parse(importExample),
          "lensId" -> JsString("using-require"),
          "inputObject" -> Json.parse("""{"definedAs":"definedAs","pathTo":"pathTo","_variables":{}}""")
        ))

        Post("/sdk-bridge/lens/test/generate", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
          val response = responseAs[JsObject]
          assert(response == Json.parse("""{"success":true,"code":"let definedAs = require('pathTo')"}"""))
        }
      }

      it("fails to generate code when invalid input") {
        val postBody = JsObject(Seq(
          "packageJson" -> Json.parse(importExample),
          "lensId" -> JsString("abc"),
          "inputObject" -> JsString("123")
        ))

        Post("/sdk-bridge/lens/test/generate", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
          val response = responseAs[JsObject]
          assert(response == Json.parse("""{"success":false,"error":"invalid request. must include fields for packageJson, lensId and inputObject"}"""))
        }
      }
    }

    describe("parse") {

      it("can parse when valid") {

        val postBody = JsObject(Seq(
          "packageJson" -> Json.parse(importExample),
          "lensId" -> JsString("using-require"),
          "input" -> JsString("let definedAs = require('pathTo')"),
          "language" -> JsString("es7")
        ))

        Post("/sdk-bridge/lens/test/parse", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
          val response = responseAs[JsObject]
          assert(response == Json.parse("""{"success":true,"result":{"definedAs":"definedAs","pathTo":"pathTo","_variables":{}}}"""))
        }

      }

      it("will fail to parse when invalid") {

        val postBody = JsObject(Seq(
          "packageJson" -> Json.parse(importExample),
          "lensId" -> JsString("using-require"),
          "input" -> JsString("let definedAs = doThing('pathTo')"),
          "language" -> JsString("es7")
        ))

        Post("/sdk-bridge/lens/test/parse", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
          val response = responseAs[JsObject]
          assert(response == Json.parse("""{"success":false,"error":"requirement failed: No model nodes from lens 'using-require' found."}"""))
        }

      }

    }

    describe("mutate") {

      it("can mutate when valid") {

        val postBody = JsObject(Seq(
          "packageJson" -> Json.parse(importExample),
          "lensId" -> JsString("using-require"),
          "input" -> JsString("let definedAs = require('pathTo')"),
          "language" -> JsString("es7"),
          "newValue" -> Json.parse("""{"definedAs":"test","pathTo":"test2","_variables":{}}""")
        ))

        Post("/sdk-bridge/lens/test/mutate", HttpEntity(ContentType(MediaTypes.`application/json`), postBody.toString())) ~> trainerRoute.route ~> check {
          val response = responseAs[JsObject]
          assert(response == Json.parse("""{"success":true,"code":"let test = require('test2')"}"""))
        }

      }

    }

  }

}
