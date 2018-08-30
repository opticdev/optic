package com.opticdev.server.http.routes

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import com.opticdev.core.trainer.{ProjectFileOptions, TestLens, Trainer}
import com.opticdev.opm.packages.OpticPackage
import com.opticdev.sdk.markdown.MarkdownParser
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import play.api.libs.json._

import scala.concurrent.ExecutionContext
import scala.util.Try

class SdkBridgeRoute(implicit executionContext: ExecutionContext) {

  val route: Route =
    post {
      pathPrefix("sdk-bridge") {
         path("lens") {
           entity(as[JsObject]) { trainerRequest =>
             val trainerResults = Try({
               val languageName = trainerRequest.value("languageName").as[JsString].value
               val snippet = trainerRequest.value("snippet").as[JsString].value
               new Trainer(languageName, snippet).returnAllCandidates
             }).flatten

             val resultWrapped = if (trainerResults.isSuccess) {
               JsObject(Seq("success" -> JsBoolean(true), "trainingResults" -> trainerResults.get.asJson))
             } else {
               println(trainerResults.failed.map(_.printStackTrace()))
               JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(trainerResults.failed.get.toString)))
             }

             complete(resultWrapped)

           }
         } ~
         pathPrefix("lens" / "test") {
           entity(as[JsObject]) { testRequest =>
             val packageObject = Try {
               val json = testRequest.value("packageJson").as[JsObject]
               OpticPackage.fromJson(json)
             }.flatten

             path("generate") {
               complete(packageObject.toString)
             } ~
             path("parse") {
               complete("parse")
             } ~
             path("mutate") {
               complete("mutate")
             }
           }
         }
      }
    }
}


