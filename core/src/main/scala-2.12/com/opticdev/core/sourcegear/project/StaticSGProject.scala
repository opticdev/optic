package com.opticdev.core.sourcegear.project

import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.project.config.ProjectFile

class StaticSGProject(name: String, baseDirectory: File, sourceGear: SourceGear)(implicit logToCli: Boolean = false, actorCluster: ActorCluster) extends OpticProject(name, baseDirectory) {
  override def projectFileChanged(newPf: ProjectFile): Unit = {}
  override def projectSourcegear: SourceGear = sourceGear

  updateWatchedFiles
}
