package com.useoptic.proxy.services.control
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import com.useoptic.common.spec_types.SpecJSONSerialization._
import scala.io.StdIn
import akka.http.scaladsl.server.Route
import com.useoptic.common.spec_types.{APIDescription, OpticAPISpec}
import com.useoptic.proxy.OpticAPIConfiguration
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.services.control.collection.Protocol._
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

object ControlRouter {
  val routes: Route = {
      path("start") {
        parameter('reset.?) { reset =>
          if (reset.isDefined) {
            CollectionSessionManager.reset
          }
          entity(as[OpticAPIConfiguration]) { configuration =>
            post {
              if (CollectionSessionManager.isRunning) {
                complete(StatusCodes.MethodNotAllowed, "Collection already in progress. Send a request to '/end' before trying again")
              } else {
                CollectionSessionManager.startSession(configuration)
                complete(StatusCodes.OK)
              }
            }
          }
        }
      } ~
      path("end") {
        post {
          if (CollectionSessionManager.isRunning) {
            val apiSpec = CollectionSessionManager.session.finish
            CollectionSessionManager.reset
            complete(apiSpec)
          } else {
            complete(StatusCodes.MethodNotAllowed, "No collection in progress. Run /start and try again")
          }
        }
      } ~ path("ping") {
        get {
          complete(StatusCodes.OK)
        }
      }
  }
}
