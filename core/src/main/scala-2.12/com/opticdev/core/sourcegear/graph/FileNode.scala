package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.parsers.utils.Crypto

case class FileNode(filePath: String, name: Option[FileNameAnnotation] = None) extends AstProjection {
  def toFile = File(filePath)
}