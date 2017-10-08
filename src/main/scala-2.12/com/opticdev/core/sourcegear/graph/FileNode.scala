package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.parsers.utils.Crypto

case class FileNode(filePath: String, lastHash: String) extends AstProjection {
  def toFile = File(filePath)
}

object FileNode {
  def fromFile(file: File) = {
    FileNode(file.pathAsString, if (file.exists) Crypto.createSha1(file.contentAsString) else null)
  }
}