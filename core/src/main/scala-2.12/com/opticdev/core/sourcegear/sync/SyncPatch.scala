package com.opticdev.core.sourcegear.sync
import com.opticdev.core.utils.StringBuilderImplicits._

import scala.collection.immutable

case class SyncPatch(changes: SyncDiff*) {
  def containsErrors = changes.exists(_.isError)

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

        FilePatch(patches.head.file, newFileContents)
      }
    }.toVector
  }

}