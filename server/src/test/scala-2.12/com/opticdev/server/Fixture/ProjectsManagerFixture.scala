package com.opticdev.server.Fixture

import better.files.File
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.status._
import com.opticdev.server.state.ProjectsManager
import com.opticdev.server.storage.ServerStorage

import scala.concurrent.{Future, Promise}

trait ProjectsManagerFixture {

  def projectsManagerWithStorage(obj: ServerStorage = ServerStorage()) = new ProjectsManager() {
    override def storage: ServerStorage = obj
  }

  def instanceWatchingTestProject : Future[ProjectsManager] = {
    val p = Promise[ProjectsManager]()

    val pm = new ProjectsManager()
    implicit val actorCluster = pm.actorCluster
    val project = Project.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml"))).get
    project.projectStatus.sourcegearChanged((i)=> {
      project.watch
      project.projectStatus.firstPassChanged((i)=> {
        if (i == Complete) p.success(pm)
      })
    })

    p.future
  }

}
