package com.opticdev.server.http

import com.opticdev.server.http.routes.{ProjectRoute, TrainerRoute}
import akka.http.scaladsl.server.Directives._
import com.opticdev.server.http.routes.socket.SocketRoute
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.ExecutionContext

class HttpService(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val projectsRoute = new ProjectRoute()
  val socketRoute = new SocketRoute()
  val trainerRoute = new TrainerRoute()

  val routes = {
    projectsRoute.route ~
      socketRoute.route ~
      trainerRoute.route
  }

}