package com.opticdev.core.sourcegear.imports

import better.files.File
import com.opticdev.parsers.imports.StandardImport

case class FileImportsRegistry(imports: Set[StandardImport] = Set()) {
  def byFile: Map[File, Set[StandardImport]] = imports.groupBy(_.file)
}