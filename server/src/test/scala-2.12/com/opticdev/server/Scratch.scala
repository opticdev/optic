package com.opticdev.server

import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.{TestPackageProviders, TestProvider}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.server.http.Server
import com.opticdev.server.state.ProjectsManager

object Scratch extends TestBase with TestPackageProviders {
  installProviders
  super.beforeAll()

  SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/target/scala-2.12/javascript-lang_2.12-1.0.jar")

  implicit val projectsManager: ProjectsManager = new ProjectsManager()
  implicit val actorCluster = projectsManager.actorCluster
  //manually adding projects for testing
  val project = Project.fromProjectFile(new ProjectFile(File("test-examples/resources/tmp/test_project/optic.yaml"))).get
  projectsManager.loadProject(project)

  def main(args: Array[String]): Unit = {
    Server.start()
  }
}
