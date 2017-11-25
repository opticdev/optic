package com.opticdev.server.http

import com.opticdev.server.http.routes.ProjectRoute
import akka.http.scaladsl.server.Directives._
import com.opticdev.server.http.routes.socket.SocketRoute
import com.opticdev.server.state.StateManager

import scala.concurrent.ExecutionContext

class HttpService(implicit executionContext: ExecutionContext, stateManager: StateManager) {

  val projectsRoute = new ProjectRoute()
  val editorConnectionRoute = new SocketRoute()

  val routes = {
    projectsRoute.route ~ editorConnectionRoute.route
  }

}