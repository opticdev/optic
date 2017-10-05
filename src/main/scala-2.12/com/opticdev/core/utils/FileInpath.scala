package com.opticdev.core.utils

import better.files.File
object FileInPath {

  implicit class FileInPath(potentialChild: File) {
    def inPathOf(parent: File) =
      potentialChild.toJava.getAbsolutePath.startsWith(parent.toJava.getAbsolutePath)

  }

}
