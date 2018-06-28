package com.opticdev.core.trainer

import better.files.File
import com.opticdev.common.storage.DataDirectoryConfig
import com.opticdev.core.sourcegear.project.config.{PFRootInterface, ProjectFile}
import com.opticdev.opm.PackageManager

import scala.util.{Failure, Success, Try}

object TrainerAppServices {
  def listAllProjects(projectFiles: Seq[String] = DataDirectoryConfig.readConfigStatus.knownProjects): Seq[ProjectFileOptions] = {
    val projectFileInterfaces = projectFiles.map(path => (path, new ProjectFile(File(path), createIfDoesNotExist = false)))

    //remove dead project files...
    val nonExistantPaths = projectFileInterfaces.filter(_._2.interface.isFailure).map(_._1)
    val updatedProjectFilesStore = projectFiles.filterNot(p=> nonExistantPaths.contains(p))
    if (updatedProjectFilesStore != projectFiles) {
      DataDirectoryConfig.saveConfigStatus(DataDirectoryConfig.readConfigStatus.copy(knownProjects = updatedProjectFilesStore))
    }

    val validProjectFiles = projectFileInterfaces.collect {case x if x._2.interface.isSuccess && x._2.projectKnowledgeSearchPaths.dirs.nonEmpty => x._2}

    val theLocalProvider = PackageManager.providers.find(_.isLocalProvider).get

    validProjectFiles.map(i=> {
      val name = i.interface.get.name
      val knowledgePaths = i.projectKnowledgeSearchPaths

      val allMarkdownFiles = knowledgePaths.dirs.flatMap(_.listRecursively).filter(_.extension.orNull == ".md")

      val parentPath = i.file.parent.pathAsString

      ProjectFileOptions(name.yamlValue.value, parentPath, knowledgePaths.dirs.head.pathAsString, allMarkdownFiles.map(i=> (i.pathAsString, i.contentAsString)).toMap)
    })
  }

  def saveMarkdown(filePath: String, contents: String): Try[File] = Try {
    val file = File(filePath)
    val isInAProject = listAllProjects().exists(i=> File(i.location).isParentOf(file))
    require(isInAProject, throw new Exception("Can not save a file if it is not in an Optic Project"))

    file.createIfNotExists(asDirectory = false).write(contents)
  }

  def newMarkdown(name: String, projectLocation: String): Try[File] = Try {
    val project = listAllProjects().find(_.location == projectLocation)
    require(project.isDefined, throw new Exception("Can not find project to save file in"))
    val stagedFile = File(project.get.firstSearchPath) / s"$name.md"
    stagedFile.createIfNotExists(asDirectory = false).write("")
  }

}
