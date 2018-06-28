package com.opticdev.server.http.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.model.headers.HttpOriginRange
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings
import com.opticdev.common.SchemaRef
import com.opticdev.core.trainer.{ProjectFileOptions, TestLens, Trainer, TrainerAppServices}
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.state.ProjectsManager
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import play.api.libs.json._

import scala.concurrent.ExecutionContext
import scala.util.Try

class TrainerRoute(implicit executionContext: ExecutionContext) {

  val route: Route =
    post {
      pathPrefix("trainer") {
          path("projects") {
            complete({
              import com.opticdev.core.trainer.projectfileoptionsFormats
              JsArray(TrainerAppServices.listAllProjects().map(p => Json.toJson[ProjectFileOptions](p)))
            })
          } ~
          path("markdown" / "create") {
            entity(as[JsObject]) { createRequest =>
              val results = Try({
                val name = createRequest.value("name").as[JsString].value
                val projectLocation = createRequest.value("projectLocation").as[JsString].value
                TrainerAppServices.newMarkdown(name, projectLocation)
              }).flatten

              if (results.isSuccess) {
                complete(JsObject(Seq("success" -> JsBoolean(true), "file" -> JsString(results.get.pathAsString))))
              } else {
                complete(JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(results.failed.get.toString))))
              }
            }
          } ~
          path("markdown" / "save") {
            entity(as[JsObject]) { createRequest =>
              val results = Try({
                val filePath = createRequest.value("filePath").as[JsString].value
                val contents = createRequest.value("contents").as[JsString].value
                TrainerAppServices.saveMarkdown(filePath, contents)
              }).flatten

              if (results.isSuccess) {
                complete(JsObject(Seq("success" -> JsBoolean(true))))
              } else {
                complete(JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(results.failed.get.toString))))
              }
            }
          } ~
          path("lens") {
            entity(as[JsObject]) { trainerRequest =>

              val trainerResults = Try({
                val expectedValue = trainerRequest.value("expectedValue").as[JsString].value
                val languageName = trainerRequest.value("languageName").as[JsString].value
                val exampleSnippet = trainerRequest.value("exampleSnippet").as[JsString].value
                new Trainer("", languageName, exampleSnippet, expectedValue).returnAllCandidates
              }).flatten

              val resultWrapped = if (trainerResults.isSuccess) {
                JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> trainerResults.get.asJson))
              } else {
                JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(trainerResults.failed.get.toString)))
              }

              complete(resultWrapped)

            }
          } ~
          path("lens" / "test") {
            entity(as[JsObject]) { testRequest =>

              val testResults = Try({
                val lensConfiguration = testRequest.value("configuration").as[JsObject]
                val markdown = testRequest.value("markdown").as[JsString].value
                val exampleSnippet = testRequest.value("testInput").as[JsString].value
                val projectBaseDir = Try(testRequest.value.get("fileProject").map(_.as[JsString].value).get).toOption
                TestLens.testLens(lensConfiguration, markdown, exampleSnippet, projectBaseDir)
              }).flatten

              val resultWrapped = if (testResults.isSuccess) {
                JsObject(Seq("success" -> JsBoolean(true), "value" -> testResults.get))
              } else {
                JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(testResults.failed.get.toString)))
              }

              complete(resultWrapped)
            }
          }
      }
    }
}


