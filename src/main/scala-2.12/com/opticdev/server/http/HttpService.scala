package com.opticdev.server.http

import com.opticdev.server.http.routes.{EditorConnectionRoute, ProjectRoute}
import com.opticdev.server.http.state.StateManager
import akka.http.scaladsl.server.Directives._
import scala.concurrent.ExecutionContext

class HttpService(implicit executionContext: ExecutionContext, stateManager: StateManager) {

  val projectsRoute = new ProjectRoute()
  val editorConnectionRoute = new EditorConnectionRoute()

  val routes = {
    projectsRoute.route ~ editorConnectionRoute.route
  }

}