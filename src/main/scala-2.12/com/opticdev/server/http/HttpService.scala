package com.opticdev.server.http

import com.opticdev.server.http.routes.ProjectsRoute
import com.opticdev.server.http.state.StateManager

import scala.concurrent.ExecutionContext

class HttpService(implicit executionContext: ExecutionContext, stateManager: StateManager) {

  val projectsRoute = new ProjectsRoute()

  val routes =
    projectsRoute.route

}