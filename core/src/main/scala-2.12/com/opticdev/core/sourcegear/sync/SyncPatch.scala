package com.opticdev.core.sourcegear.sync
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.utils.StringBuilderImplicits._
import play.api.libs.json._

import scala.collection.immutable

case class SyncPatch(changes: Vector[SyncDiff], warnings: Vector[SyncWarning])(implicit project: ProjectBase) {
  def containsErrors = changes.exists(_.isError)
  def noErrors = !containsErrors

  def isEmpty = changes.isEmpty
  def nonEmpty = changes.nonEmpty

  def errors: Vector[ErrorEvaluating] = changes.collect { case e: ErrorEvaluating => e }

  def filePatches: Vector[FilePatch] = {
    val rangePatches = changes.collect {
      case a: Replace => a.rangePatch
    }

    val fileRangePatches = rangePatches.groupBy(_.file)

    fileRangePatches.map {
      case (file, patches) => {
        val newFileContents =
             patches
            .sortBy(_.range.end)
            .reverse
            .foldLeft ( new StringBuilder(patches.head.fileContents) ) {
              case (contents, change) => {
                contents.updateRange(change.range, change.newRaw)
              }
            }.toString()

        FilePatch(patches.head.file, patches.head.fileContents, newFileContents)
      }
    }.toVector
  }

  def triggers: Map[Trigger, Vector[Replace]] = {
    changes.collect { case a: Replace => a }.groupBy(_.trigger.get)
  }

  def asJson : JsValue = JsObject(Seq(
    "warnings" -> JsArray(warnings.map(_.asJson)),
    "errors" -> JsArray(errors.map(_.asJson)),
    "changes" -> JsArray(filePatches.map(fp=> fp.asJson(project.trimAbsoluteFilePath(fp.file.pathAsString)))),
    "triggers" -> {
      JsArray(triggers.map {
        case (trigger, changes) => {
          import com.opticdev.core.sourcegear.sync.triggerFormat
          val jsObject = Json.toJsObject(trigger)
          val groupedBySchema = changes.groupBy(_.schemaRef)
          val changeString = JsArray(groupedBySchema.map(i=> JsString(s"${i._2.length} ${if (i._2.length == 1) "instance" else "instances"} of ${i._1.internalFull}")).toSeq)
          jsObject + ("changes" -> changeString)
        }
      }.toSeq)
    }
  ))


}