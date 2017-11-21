package com.opticdev.server.http.state

import better.files.File
import com.opticdev.core.sourcegear.project.{OpticProject, Project}

class StateManager(initialProjects: Set[OpticProject] = Set()) {

  private val projectsStore = initialProjects.to[scala.collection.mutable.Set]
  def addProject(project: OpticProject) = projectsStore += project
  def removeProject(project: OpticProject) = projectsStore -= project
  def allProjects = projectsStore.toSet

  def lookupProject(projectName: String): Option[OpticProject] = projectsStore.find(_.name == projectName)

  def projectForFile(file: File) : Option[OpticProject] = {
    import com.opticdev.core.utils.FileInPath._
    projectsStore.find(i=> file.inPathOf(i.baseDirectory))
  }

}

object StateManager {
  def empty = new StateManager(Set())
  def load  = empty
}
