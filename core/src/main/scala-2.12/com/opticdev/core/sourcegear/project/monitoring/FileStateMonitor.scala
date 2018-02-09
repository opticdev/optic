package com.opticdev.core.sourcegear.project.monitoring

import better.files.File

import scala.util.Try


/* Goals

1. Make sure unsaved changes are read by optic and not whatever's stored on the disk
2. Ensure that the most recent version of a file is used when Optic makes changes
3. Allow normal file writes (git branch changing for instance) to take effect without conflict.
4. Eliminate duplicate parse operations

 */

class FileStateMonitor() {

  def contentsForPath(path: String): Try[String] = contentsForFile(File(path))
  def contentsForFile(file: File): Try[String] = Try {
    stagedContents.getOrElse(file, StagedContent(file.contentAsString)).text
  }


  private val stagedContents = scala.collection.mutable.Map[File, StagedContent]()

  //push unsaved changes into Optic for processing
  def stageContents(file: File, content: String) = {
    stagedContents += file -> StagedContent(content)
  }

  def markUpdated(file: File) = {
    stagedContents -= file
  }

  def fileHasStagedContents(file: File) : Boolean = stagedContents.contains(file)

  def allStaged: Map[File, StagedContent] = stagedContents.toMap

}
