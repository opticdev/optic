package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor

trait ChangeResult {
  def isSuccess : Boolean
  def isFailure : Boolean = !isSuccess
  def errors : Seq[Throwable] = Seq.empty

  def asFileChanged = this.asInstanceOf[FileChanged]
}

case class FileChanged(file: File, newContents: String, patchInfo: Option[PatchInfo] = None) extends ChangeResult {
  override def isSuccess = true

  def stageContentsIn(fileStateMonitor: FileStateMonitor) = {
    fileStateMonitor.stageContents(file, newContents)
  }
}

case class ToClipboard(newContent: String) extends ChangeResult {
  override def isSuccess = true
}

case class FilesChanged(fileChanges: FileChanged*) extends ChangeResult {
  override def isSuccess = true
}

case class FailedToChange(throwable: Throwable) extends ChangeResult {
  override def isSuccess = false
}

//a valid response to do nothing
case object NoChanges extends ChangeResult {
  override def isSuccess = true
}


//additional data
case class PatchInfo(range: Range, updated: String)