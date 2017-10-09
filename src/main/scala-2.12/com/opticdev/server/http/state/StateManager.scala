package com.opticdev.server.http.state

import better.files.File
import com.opticdev.core.sourcegear.project.Project

class StateManager(initialProjects: Set[Project] = Set()) {

  private val projectsStore = initialProjects.to[scala.collection.mutable.Set]
  def addProject(project: Project) = projectsStore += project
  def removeProject(project: Project) = projectsStore -= project
  def allProjects = projectsStore.toSet

  def lookupProject(projectName: String): Option[Project] = projectsStore.find(_.name == projectName)

  def projectForFile(file: File) : Option[Project] = {
    import com.opticdev.core.utils.FileInPath._
    projectsStore.find(i=> file.inPathOf(i.baseDirectory))
  }

}

object StateManager {
  def empty = new StateManager(Set())
  def load  = empty
}
