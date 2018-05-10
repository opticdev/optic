package com.opticdev.core.sourcegear.project

import akka.util.Timeout
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.{ActorCluster, SetCurrentGraph}
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.status._
import scala.concurrent.duration._
import scala.concurrent.Await
import akka.pattern.ask


//@todo consider moving this class to a test suite. Has no use in prod

class StaticSGProject(name: String, baseDirectory: File, sourceGear: SourceGear)(implicit actorCluster: ActorCluster) extends OpticProject(name, baseDirectory) {

  override def projectFileChanged(newPf: ProjectFile): Unit = {}
  override def projectSourcegear: SourceGear = sourceGear

  private var projectGraphStore : ProjectGraph = ProjectGraphWrapper.empty()(project = this).projectGraph
  def stageProjectGraph(projectGraph: ProjectGraph) = {
    projectGraphStore = projectGraph
  }
  override def projectGraph: ProjectGraph = projectGraphStore

  override def projectGraphWrapper: ProjectGraphWrapper = {
    new ProjectGraphWrapper(projectGraph)(project = this)
  }

  projectStatusInstance.configStatus = ValidConfig
  projectStatusInstance.sourceGearStatus = Valid

//  syncMonitor.cancel()

}
