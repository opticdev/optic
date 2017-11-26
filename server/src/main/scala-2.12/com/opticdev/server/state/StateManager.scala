package com.opticdev.server.state

import better.files.File
import com.opticdev.core.sourcegear.project.{OpticProject, Project}

import scala.collection.mutable

class StateManager(initialProjects: Set[OpticProject] = Set()) {

  private val projectsStore: mutable.Set[OpticProject] = initialProjects.to[scala.collection.mutable.Set]
  def addProject(project: OpticProject) : Unit = projectsStore += project
  def removeProject(project: OpticProject) : Unit = projectsStore -= project
  def allProjects: Set[OpticProject] = projectsStore.toSet

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
