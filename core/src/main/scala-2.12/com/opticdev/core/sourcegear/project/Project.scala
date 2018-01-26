package com.opticdev.core.sourcegear.project

import java.nio.file.{StandardWatchEventKinds => EventType}

import better.files.File
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.status._
import com.opticdev.core.sourcegear.{SGConstructor, SourceGear}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

class Project(name: String, baseDirectory: File)(implicit logToCli: Boolean = false, actorCluster: ActorCluster) extends OpticProject(name, baseDirectory) {

  private var sourceGear: SourceGear = {
    projectFileChanged(projectFile)
    SourceGear.default
  }

  //do this after sourcegear is initialized

  override def projectFileChanged(newPf: ProjectFile): Unit = {
    super.projectFileChanged(newPf)
    if (newPf.interface.isSuccess) {
      SGConstructor.fromProjectFile(newPf)(projectSearchPaths).onComplete(i => {
        if (i.isSuccess) {
          sourceGear = i.get.inflate
          projectStatusInstance.sourceGearStatus = Valid
          if (projectStatus.monitoringStatus == Watching) rereadAll
        } else {
          projectStatusInstance.sourceGearStatus = Invalid(i.failed.get.getMessage)
        }
      })
    }
  }

  override def projectSourcegear = sourceGear

}

object Project {
  def fromProjectFile(pf: ProjectFile)(implicit actorCluster: ActorCluster) : Try[OpticProject] = Try {
    val name = pf.interface.get.name
    new Project(name.yamlValue.value, pf.file.parent)
  }
}