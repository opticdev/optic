package com.useoptic.proxy.services.proxy
import java.net.InetSocketAddress

import akka.actor.ActorSystem
import akka.http.scaladsl.{ClientTransport, Http}
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer

import scala.io.StdIn
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.settings.{ClientConnectionSettings, ConnectionPoolSettings}
import com.useoptic.proxy.ProxyConfig
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.services.control.collection.Protocol._
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import HttpRequestImplicits._
import com.useoptic.proxy.Lifecycle.actorSystem
import com.useoptic.proxy.Lifecycle.executionContext

import scala.util.{Failure, Success}

object ProxyRouter {

  val proxyTo = ProxyConfig("localhost", 3005)

  val routes: Route = {
    path(".*".r) { _ =>
      extractRequest {request => {

        val updated = request.updateHost(proxyTo.host, proxyTo.port)

        val opticRequest = request.toOpticRequest

        onComplete(Http().singleRequest(updated)) { responseTry =>
          if (responseTry.isSuccess) {
            complete(responseTry.get)
          } else {
            complete(StatusCodes.ServiceUnavailable, s"Optic Proxy Failed. Service at ${proxyTo.host} ${proxyTo.port}")
          }
        }

      }}
    }
  }
}
