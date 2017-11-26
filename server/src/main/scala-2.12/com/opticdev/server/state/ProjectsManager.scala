package com.opticdev.server.state

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.server.storage.ServerStorage
import com.opticdev.server
import com.opticdev.core.actorSystem
import scala.collection.mutable
import scala.util.{Success, Try}

class ProjectsManager {

  implicit val actorCluster: ActorCluster = new ActorCluster(actorSystem)

  val MAX_PROJECTS = 6

  private var projectsStore: Vector[OpticProject] = Vector()

  private def addProject(project: OpticProject) : Unit =  {
    projectsStore = projectsStore :+ project
    if (projectsStore.size > MAX_PROJECTS) {
      val (toRemove, projects) = projectsStore.splitAt(projectsStore.size - MAX_PROJECTS)
      projectsStore = projects
      toRemove.foreach(removeProject)
    }
  }

  private def removeProject(project: OpticProject) : Unit = {
    //spin down projects and save to disk
    project.stopWatching
    projectsStore = projectsStore.filterNot(_ == project)
  }

  def allProjects: Vector[OpticProject] = projectsStore


  //query for project / manage loading projects from storage
  def lookupProject(projectName: String) : Try[OpticProject] = Try {
    //check if we are already watching the project. If so, return reference to it
    val alreadyTrackingOption = allProjects.find(_.name == projectName)
    if (alreadyTrackingOption.isDefined) return Success(alreadyTrackingOption.get)

    //look in our known projects store and see if we can find it.
    val knownProjects = storage.projects
    val knownProjectOption = knownProjects.get(projectName)
    if (knownProjectOption.isDefined) {
      val baseDir = knownProjectOption.get
      return loadProject(projectName, File(baseDir))
    }

    throw new Error("No project found for name: "+projectName)

  }

  def lookupProject(includedFile: File) : Try[OpticProject] = Try {
    import com.opticdev.core.utils.FileInPath._
    //check if it's in memory
    val projectOption = projectsStore.find(i=> includedFile.inPathOf(i.baseDirectory))
    if (projectOption.isDefined) {
      return Success(projectOption.get)
    }

    //check for an optic package in a parent directory
    val projectFileOption = includedFile.projectFileOption
    if (projectFileOption.isDefined) {
      return Success(loadProject(Project.fromProjectFile(projectFileOption.get).get))
    }

    throw new Error("No project including "+includedFile.pathAsString+" found")
  }

  //load project
  def loadProject(name: String, baseDir: File) : Try[OpticProject] = Try {
    //@todo write a project validator function ie -> has optic.yaml, that is valid.
    if (!baseDir.exists) throw new FileNotFoundException("Optic project not found at "+baseDir.pathAsString)
    if (allProjects.exists(_.name == name)) throw new Error("Project with name "+name+" already being tracked. Please give your projects unique names")

    val project = new Project(name, baseDir)
    loadProject(project)
  }

  def loadProject(project: OpticProject) : OpticProject = {
    project.watch
    addProject(project)
    project
  }

  def storage = ServerStorage.reload

}
