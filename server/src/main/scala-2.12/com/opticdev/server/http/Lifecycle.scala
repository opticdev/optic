package com.opticdev.server.http

import com.opticdev.server.state.ProjectsManager
object Lifecycle extends App {

  implicit val projectsManager: ProjectsManager = new ProjectsManager()

  startup
  def startup = {
    Server.start()
  }


}
