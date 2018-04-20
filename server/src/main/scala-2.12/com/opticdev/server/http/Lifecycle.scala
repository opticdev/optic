package com.opticdev.server.http

import java.io.{BufferedReader, InputStreamReader}

import better.files.File
import com.opticdev.common.storage.{DataDirectory, DataDirectoryConfig}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.opm.PackageManager
import com.opticdev.opm.providers.LocalProvider
import com.opticdev.opm.storage.{PackageStorage, ParserStorage}
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.markdown.OpticMarkdownInstaller
import com.opticdev.server.analytics.{MixpanelManager, ServerStart}
import com.opticdev.server.state.ProjectsManager

import scala.io.Source
import scala.util.Try

object Lifecycle extends App {

  //init the data directory if missing
  DataDirectory.init

  //@todo load parsers dynamically.
  val jar = this.getClass.getClassLoader.getResource("es7_2.12-0.1.3.jar").getFile
  val parserBase = Try {
    ParserStorage.writeToStorage(File(jar))
    SourceParserManager.installParser(jar).get
  }.getOrElse {
    val withoutFileExtension = jar.substring(5)
    val pathAsString = (File(withoutFileExtension).parent.parent / "es7_2.12-0.1.3.jar").pathAsString
    ParserStorage.writeToStorage(File(pathAsString))
    SourceParserManager.installParser(pathAsString).get
  }

  implicit val projectsManager: ProjectsManager = new ProjectsManager()
  implicit val actorCluster = projectsManager.actorCluster

  startup
  def startup = {
    Server.start()

    DataDirectoryConfig.triggerMigration

    //tap the OpticMarkdown Installer in case this is a fresh install
    OpticMarkdownInstaller.getOrInstall

    MixpanelManager.event(ServerStart)

  }


}
