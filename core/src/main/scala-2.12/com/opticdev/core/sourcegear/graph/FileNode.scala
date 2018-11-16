package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation

case class FileNode(filePath: String,
                    name: Option[FileNameAnnotation] = None)(implicit fileGraph: ProjectGraph) extends AstProjection {
  def toFile = File(filePath)
}