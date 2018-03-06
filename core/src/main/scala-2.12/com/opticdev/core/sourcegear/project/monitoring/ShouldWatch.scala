package com.opticdev.core.sourcegear.project.monitoring

import better.files.File
import com.opticdev.core.sourcegear.SourceGear

object ShouldWatch {
  def file(file: File, validExtensions: Set[String], excludedPaths: Seq[File]) : Boolean = {
    val isValidFile =
    file.isRegularFile &&
    file.extension.isDefined &&
    validExtensions.contains(file.extension.get)

    if (isValidFile) {

      excludedPaths.filter(_.exists).foldLeft(true) {
        case (bool, path) => {
          if (!bool) bool else {
            !( path.isSameFileAs(file) || path.isParentOf(file))
          }
        }
      }

    } else false

  }
}
