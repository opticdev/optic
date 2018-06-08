package com.opticdev.server.state

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.arrow.Arrow
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.server.storage.ServerStorage
import com.opticdev.server
import com.opticdev.core.actorSystem
import com.opticdev.core.debug.{DebugMarkdownProject, DebugSourceGear}
import com.opticdev.core.sourcegear.project.status.{ImmutableProjectStatus, ProjectStatus}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectInfo}
import com.opticdev.server.http.routes.socket.agents.{AgentConnection, KnowledgeGraphUpdate, StatusUpdate}

import scala.collection.mutable
import scala.util.{Success, Try}

class ProjectsManager {

  implicit val actorCluster: ActorCluster = new ActorCluster(actorSystem)

  val nodeKeyStore: NodeKeyStore = new NodeKeyStore

  val MAX_PROJECTS = 6

  private var arrowStore: Map[OpticProject, Arrow] = Map()
  private var projectsStore: Vector[OpticProject] = Vector()

  //do not allocate unless it's being used.
  lazy val debugMarkdownProject = {
    DebugSourceGear.getHostProjectOption = Some((file)=> lookupProject(file).toOption)
    DebugMarkdownProject()
  }

  private def addProject(project: OpticProject) : Unit =  {

    //attach a sourcegear changed callback
    project.onSourcegearChanged((sg)=> {
      //overwrite old sg instance with the new one
      val arrow = new Arrow(project)
      arrowStore = arrowStore + (project -> arrow)
      AgentConnection.broadcastUpdate(KnowledgeGraphUpdate(project.name, arrow.knowledgeGraphAsJson))
    })

    //attach a project status changed callback
    project.projectStatus.statusChanged((changed, status)=> {
      AgentConnection.broadcastUpdate(StatusUpdate(project.name, status))
      AgentConnection.broadcastUpdate(KnowledgeGraphUpdate(project.name, arrowStore(project).knowledgeGraphAsJson))
    })


    //send an initial status update
    AgentConnection.broadcastUpdate(StatusUpdate(project.name, project.projectStatus))

    projectsStore = projectsStore :+ project
    arrowStore = arrowStore + (project -> new Arrow(project))
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
    arrowStore = arrowStore.filterNot(_._1 == project)
  }

  def activeProjects: Vector[OpticProject] = projectsStore
  def allProjects: Vector[ProjectInfo] = {
    projectsStore.map(_.projectInfo) ++
      storage.projects
        .filterNot(i=> projectsStore.exists(p=> p.name == i._1 || p.baseDirectory.isSameFileAs(File(i._2))))
        .map(i=> ProjectInfo(i._1, i._2, ProjectStatus.notLoaded))
  }

  //query for project / manage loading projects from storage
  def lookupProject(projectName: String) : Try[OpticProject] = Try {
    //check if we are already watching the project. If so, return reference to it
    val alreadyTrackingOption = activeProjects.find(_.name == projectName)
    if (alreadyTrackingOption.isDefined) return {
      _lastProjectName = Some(alreadyTrackingOption.get.name)
      Success(alreadyTrackingOption.get)
    }

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
      _lastProjectName = Some(projectOption.get.name)
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
    if (activeProjects.exists(_.name == name)) throw new Error("Project with name "+name+" already being tracked. Please give your projects unique names")
    _lastProjectName = Some(name)
    val project = new Project(name, baseDir)
    loadProject(project)
  }

  def loadProject(project: OpticProject) : OpticProject = {
    project.watch
    _lastProjectName = Some(project.name)
    addProject(project)
    project
  }

  def storage = ServerStorage.reload


  //finding arrow instances
  def lookupArrow(includedFile: File) : Option[Arrow] = lookupProject(includedFile).map(i=> arrowStore(i)).toOption
  def lookupArrow(projectName: String) : Option[Arrow] = lookupProject(projectName).map(i=> arrowStore(i)).toOption
  def lookupArrow(project: OpticProject) : Option[Arrow] = arrowStore.get(project)


  private var _lastProjectName : Option[String] = None
  def lastProjectName = _lastProjectName

  def sendMostRecentUpdate = Try {
    val project = lookupProject(_lastProjectName.get).get
    AgentConnection.broadcastUpdate(StatusUpdate(_lastProjectName.get, project.projectStatus))
  }

}
