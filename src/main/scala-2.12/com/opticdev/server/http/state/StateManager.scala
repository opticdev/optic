package com.opticdev.server.http.state

import com.opticdev.core.sourcegear.project.Project

class StateManager(initialProjects: Set[Project]) {

  private val projectsStore = initialProjects.to[scala.collection.mutable.Set]
  def addProject(project: Project) = projectsStore += project
  def removeProject(project: Project) = projectsStore -= project
  def allProjects = projectsStore.toSet
  def lookupProject(projectName: String): Option[Project] = projectsStore.find(_.name == projectName)
}

object StateManager {
  def clean = new StateManager(Set())
  def load  = clean
}
