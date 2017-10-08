package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.parsers.utils.Crypto

case class FileNode(filePath: String, lastHash: String) extends AstProjection

object FileNode {
  def fromFile(file: File) = FileNode(file.pathAsString, Crypto.createSha1(file.contentAsString))
}