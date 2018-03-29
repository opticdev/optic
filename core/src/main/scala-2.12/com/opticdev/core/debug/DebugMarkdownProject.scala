package com.opticdev.core.debug

import better.files.File
import com.opticdev.core.sourcegear
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.status._
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.parsers.ParserBase
import com.opticdev.sdk.descriptions.Schema
import com.opticdev.sdk.descriptions.transformation.Transformation

import scala.util.Try

case class DebugMarkdownProject(name: String)(implicit logToCli: Boolean = false, actorCluster: ActorCluster) extends ProjectBase {

  protected val projectStatusInstance: ProjectStatus = new ProjectStatus(_configStatus = ValidConfig, _sourceGearStatus = Valid)
  val projectStatus = projectStatusInstance.immutable

  override def projectSourcegear: SourceGear = ???

  override def projectGraph: ProjectGraph = ???

  override def shouldWatchFile(file: File): Boolean = ???
}
