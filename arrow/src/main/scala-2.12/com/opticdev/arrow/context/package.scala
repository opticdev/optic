package com.opticdev.arrow

import better.files.File
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.opm.packages.OpticPackage

package object context {

  sealed trait ArrowContextBase

  case object NoContext extends ArrowContextBase

  //simple context based on file/position
  case class FileContext(file: File, range: Range) extends ArrowContextBase

  //more advanced context with file context & models
  case class ModelContext(file: File, range: Range, models: Vector[ModelNode]) extends ArrowContextBase

}
