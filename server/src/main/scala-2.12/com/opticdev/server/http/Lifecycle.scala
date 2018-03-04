package com.opticdev.server.http

import better.files.File
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.PackageManager
import com.opticdev.opm.providers.LocalProvider
import com.opticdev.opm.storage.{PackageStorage, ParserStorage}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.server.state.ProjectsManager
object Lifecycle extends App {

  PackageStorage.clearLocalPackages

  //set the local providers for the OPM
  PackageManager.setProviders(new LocalProvider)

  //@todo load parsers dynamically.
  val jar = this.getClass.getClassLoader.getResource("es7_2.12-0.1.0.jar").getPath
  val defaultParserTry = SourceParserManager.installParser(jar)
  ParserStorage.writeToStorage(File(jar))

  implicit val projectsManager: ProjectsManager = new ProjectsManager()
  implicit val actorCluster = projectsManager.actorCluster
  //manually adding projects for testing
//  val project = Project.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml"))).get
//  projectsManager.loadProject(project)

  startup
  def startup = {
    Server.start()
  }


}
