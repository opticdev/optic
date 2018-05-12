package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.parsers.utils.Crypto

case class FileNode(filePath: String) extends AstProjection {
  def toFile = File(filePath)
}