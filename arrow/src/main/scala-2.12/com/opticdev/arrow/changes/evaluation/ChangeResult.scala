package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor

trait ChangeResult {
  def isSuccess : Boolean
  def isFailure : Boolean = !isSuccess
  def errors : Seq[Throwable] = Seq.empty

  def asFileChanged = this.asInstanceOf[FileChanged]
}

case class FileChanged(file: File, newContents: String) extends ChangeResult {
  override def isSuccess = true

  def stageContentsIn(fileStateMonitor: FileStateMonitor) = {
    fileStateMonitor.stageContents(file, newContents)
  }
}
case class FailedToChange(throwable: Throwable) extends ChangeResult {
  override def isSuccess = false
}

//a valid response to do nothing
case object NoChanges extends ChangeResult {
  override def isSuccess = true
}