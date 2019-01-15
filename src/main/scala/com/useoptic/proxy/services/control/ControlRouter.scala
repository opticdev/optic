package com.useoptic.proxy.services.control
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer

import scala.io.StdIn
import akka.http.scaladsl.server.Route
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.services.control.collection.Protocol._
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

object ControlRouter {
  val routes: Route = {
      path("start") {
        entity(as[StartCollection]) { startCollection =>
          post {
            if (CollectionSessionManager.isRunning) {
              complete(StatusCodes.MethodNotAllowed, "Collection already in progress. 'Run /end' before trying again")
            } else {
              CollectionSessionManager.startSession(startCollection.project_name, startCollection.forwardTo)
              complete(StatusCodes.OK)
            }
          }
        }
      } ~
      path("end") {
        post {
          if (CollectionSessionManager.isRunning) {
            complete(StatusCodes.OK)
          } else {
            complete(StatusCodes.MethodNotAllowed, "No collection in progress. Run /start and try again")
          }
        }
      }
  }
}
