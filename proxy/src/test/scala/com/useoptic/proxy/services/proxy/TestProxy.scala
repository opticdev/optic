package com.useoptic.proxy.services.proxy

import akka.http.scaladsl.Http
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.path
import com.useoptic.proxy.services.control.ControlRouter
import com.useoptic.proxy.Lifecycle.actorSystem
import com.useoptic.proxy.Lifecycle.executionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer

import scala.concurrent.duration._
import scala.concurrent.Await

object TestProxy {
  implicit val materializer = ActorMaterializer()

  def start = {
    val routes: Route = {
      path(".*".r) { _ =>
        extractRequest { request => {
          if (request.entity.toString.contains("Provide Error")) {
            complete(StatusCodes.BadRequest)
          } else {
            complete("Hello World from " + request.toString())
          }

        }}
      }
    }

    val future = Http().bindAndHandle(routes, "localhost", 3005)
    val a = Await.result(future, 10 seconds)
  }

}
