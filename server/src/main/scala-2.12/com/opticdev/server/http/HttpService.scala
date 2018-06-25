package com.opticdev.server.http

import akka.http.javadsl.model.headers.HttpOrigin
import akka.http.scaladsl.model.headers
import akka.http.scaladsl.model.headers.{HttpOrigin, HttpOriginRange}
import com.opticdev.server.http.routes.{ProjectRoute, TrainerRoute}
import akka.http.scaladsl.server.Directives._
import ch.megard.akka.http.cors.scaladsl.CorsDirectives.cors
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings
import com.opticdev.server.http.routes.socket.SocketRoute
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.ExecutionContext

class HttpService(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val projectsRoute = new ProjectRoute()
  val socketRoute = new SocketRoute()
  val trainerRoute = new TrainerRoute()

  val settings: CorsSettings.Default = CorsSettings.defaultSettings.copy().withAllowedOrigins(HttpOriginRange(
    headers.HttpOrigin("http://localhost:3000")
  ))

  val routes = {
      projectsRoute.route ~
      socketRoute.route ~ cors(settings) {
        trainerRoute.route
      }
  }

}