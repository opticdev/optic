package com.opticdev.server.http.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import com.opticdev.common.SchemaRef
import com.opticdev.core.trainer.Trainer
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.state.ProjectsManager
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import play.api.libs.json._

import scala.concurrent.ExecutionContext
import scala.util.Try

class TrainerRoute(implicit executionContext: ExecutionContext) {

  val route: Route =
    pathPrefix("trainer") {
      parameters('expectedValue, 'languageName, 'exampleSnippet) { (expectedValue, languageName, exampleSnippet) =>
        path("lens") {

          val trainerResults = Try(new Trainer("", languageName, exampleSnippet, expectedValue).returnAllCandidates).flatten

          val resultWrapped = if (trainerResults.isSuccess) {
            JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> trainerResults.get.asJson))
          } else {
            JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(trainerResults.failed.get.getMessage)))
          }

          complete(resultWrapped)

        }
      }
  }
}
