package com.opticdev.server.Fixture

import better.files.File
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.server.state.ProjectsManager
import com.opticdev.server.storage.ServerStorage

trait ProjectsManagerFixture {

  def projectsManagerWithStorage(obj: ServerStorage = ServerStorage()) = new ProjectsManager() {
    override def storage: ServerStorage = obj
  }

  def instanceWatchingTestProject = {
    val pm = new ProjectsManager()
    implicit val actorCluster = pm.actorCluster
    Project.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml")))
    pm
  }

}
