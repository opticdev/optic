package com.opticdev.arrow.changes

import better.files.File
import com.opticdev.core.sourcegear.project.monitoring.{FileStateMonitor, StagedContent}
import play.api.libs.json.{JsArray, JsBoolean, JsObject, JsString}

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

    def asJson = {
      JsObject(Seq("success" -> JsBoolean(isSuccess), "stagedFileChanges" -> JsArray(
        stagedFiles.map(i=> JsObject(Seq(
          "path" -> JsString(i._1.pathAsString),
          "contents" -> JsString(i._2.text)
        ))).toSeq
      )))
    }

  }

  case class IntermediateTransformPatch(file: File, range: Range, newContents: String)

}
