package com.opticdev.server.http.controllers

import better.files.File
import com.opticdev.core.debug
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.Future

class DebugQuery(file: File, range: Range, contentsOption: Option[String])(implicit projectsManager: ProjectsManager) {

  def execute: Future[Option[debug.DebugInfo]] = {
    val debugMarkdownProject = projectsManager.debugMarkdownProject

    contentsOption.map(i=> debugMarkdownProject.stageFileContents(file, i))

    debugMarkdownProject.contextFor(file, range)
  }

}
