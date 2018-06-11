package com.opticdev.core.sourcegear.project.monitoring

import better.files.File

import scala.util.Try


/* Goals

1. Make sure unsaved changes are read by optic and not whatever's stored on the disk
2. Ensure that the most recent version of a file is used when Optic makes changes
3. Allow normal file writes (git branch changing for instance) to take effect without conflict.
4. Eliminate duplicate parse operations

 */

class FileStateMonitor(otherMonitors: FileStateMonitor*) {

  private val prioritySeq = Seq(this) ++ otherMonitors

  def contentsForPath(path: String): Try[String] = contentsForFile(File(path))
  def contentsForFile(file: File): Try[String] = Try {
    val starting : Option[StagedContent] = None
    prioritySeq.foldLeft(starting) {
      case (foundOption, fileMonitor) => {
        if (foundOption.isEmpty) {
          fileMonitor.allStaged.get(file)
        } else None
      }
    }.getOrElse(StagedContent({
      if (file.exists) file.contentAsString else ""
    })).text
  }


  private val stagedContents = scala.collection.mutable.Map[File, StagedContent]()

  //push unsaved changes into Optic for processing
  def stageContents(file: File, content: String) = {
    stagedContents += file -> StagedContent(content)
  }

  def markUpdated(file: File) : Unit = {
    stagedContents -= file
    prioritySeq.splitAt(1)._2.foreach(_.markUpdated(file))
  }

  def fileHasStagedContents(file: File) : Boolean = stagedContents.contains(file)

  def allStaged: Map[File, StagedContent] = stagedContents.toMap

}
