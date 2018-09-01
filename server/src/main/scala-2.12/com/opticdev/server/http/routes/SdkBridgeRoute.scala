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
             val packageObjectTry = Try(testRequest.value("packageJson").as[JsObject])
             val lensIdTry = Try(testRequest.value("lensId").as[JsString].value)

             path("generate") {
               val inputObjectTry = Try(testRequest.value("inputObject").as[JsObject])

               val resultWrapped = if (packageObjectTry.isFailure || lensIdTry.isFailure || inputObjectTry.isFailure) {
                 JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString("invalid request. must include fields for packageJson, lensId and inputObject")))
               } else {
                 val generate = TestLens.testLensGenerate(packageObjectTry.get, lensIdTry.get, inputObjectTry.get)
                 if (generate.isSuccess) {
                   JsObject(Seq("success" -> JsBoolean(true), "code" -> JsString(generate.get)))
                 } else {
                   JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(generate.failed.map(_.getMessage).get)))
                 }
               }

               complete(resultWrapped)

             } ~
             path("parse") {

               val inputTry = Try(testRequest.value("input").as[JsString].value)
               val languageTry = Try(testRequest.value("language").as[JsString].value)

               val resultWrapped = if (packageObjectTry.isFailure || lensIdTry.isFailure || inputTry.isFailure || languageTry.isFailure) {
                 JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString("invalid request. must include fields for packageJson, lensId, language and input")))
               } else {
                 val parse = TestLens.testLensParse(packageObjectTry.get, lensIdTry.get, inputTry.get, languageTry.get)
                 if (parse.isSuccess) {
                   JsObject(Seq("success" -> JsBoolean(true), "result" -> parse.get))
                 } else {
                   JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(parse.failed.map(_.getMessage).get)))
                 }
               }

               complete(resultWrapped)
             } ~
             path("mutate") {

               val inputTry = Try(testRequest.value("input").as[JsString].value)
               val languageTry = Try(testRequest.value("language").as[JsString].value)
               val newValueTry = Try(testRequest.value("newValue").as[JsObject])

               val resultWrapped = if (packageObjectTry.isFailure || lensIdTry.isFailure || inputTry.isFailure || languageTry.isFailure || newValueTry.isFailure) {
                 JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString("invalid request. must include fields for packageJson, lensId, language, input and newValue")))
               } else {
                 val mutate = TestLens.testLensMutate(packageObjectTry.get, lensIdTry.get, inputTry.get, languageTry.get, newValueTry.get)
                 if (mutate.isSuccess) {
                   JsObject(Seq("success" -> JsBoolean(true), "result" -> JsString(mutate.get)))
                 } else {
                   JsObject(Seq("success" -> JsBoolean(false), "error" -> JsString(mutate.failed.map(_.getMessage).get)))
                 }
               }

               complete(resultWrapped)
             }
           }
         }
      }
    }
}


