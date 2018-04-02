package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.core.debug
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.Future

class DebugQuery(file: File, range: Range)(implicit projectsManager: ProjectsManager) {

  def execute: Future[Option[debug.DebugInfo]] = {
    val debugMarkdownProject = projectsManager.debugMarkdownProject
    debugMarkdownProject.contextFor(file, range)
  }

}
