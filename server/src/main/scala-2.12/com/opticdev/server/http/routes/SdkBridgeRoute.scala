package com.opticdev.server.http.routes

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import com.opticdev.core.trainer.{ProjectFileOptions, TestLens, Trainer, TrainerAppServices}
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import play.api.libs.json._

import scala.concurrent.ExecutionContext
import scala.util.Try

class SdkBridgeRoute(implicit executionContext: ExecutionContext) {

  val route: Route =
    post {
      pathPrefix("sdk-bridge") {
         path("lens") {

         }
      }
    }
}


