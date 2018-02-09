package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.{FileStateMonitor, StagedContent}

import scala.util.Try

package object evaluation {

  case class BatchedChanges(changes: Seq[ChangeResult], stagedFiles: Map[File, StagedContent]) {
    val isSuccess = changes.forall(_.isSuccess)
    val isFailure = !isSuccess

    def flushToDisk = Try {
      stagedFiles.par.foreach {
        case (file, stagedContent) => file.write(stagedContent.text)
      }
    }
  }

}
