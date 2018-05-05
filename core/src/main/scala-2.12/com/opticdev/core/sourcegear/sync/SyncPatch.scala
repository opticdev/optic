package com.opticdev.core.sourcegear.sync
import com.opticdev.core.utils.StringBuilderImplicits._
import play.api.libs.json.{JsArray, JsObject, JsValue, Json}

import scala.collection.immutable

case class SyncPatch(changes: Vector[SyncDiff], warnings: Vector[SyncWarning]) {
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

  def asJson : JsValue = JsObject(Seq(
    "warnings" -> JsArray(warnings.map(_.asJson)),
    "errors" -> JsArray(errors.map(_.asJson)),
    "changes" -> JsArray(filePatches.map(Json.toJson[FilePatch]))
  ))


}