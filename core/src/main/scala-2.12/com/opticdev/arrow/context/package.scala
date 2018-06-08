package com.opticdev.arrow

import better.files.File
import com.opticdev.arrow.changes.location.{AsChildOf, InsertLocation, RawPosition}
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.opm.packages.OpticPackage

package object context {

  sealed trait ArrowContextBase {
    def toInsertLocation : Option[InsertLocation]
  }

  case object NoContext extends ArrowContextBase {
    override def toInsertLocation: Option[InsertLocation] = None
  }

  //simple context based on file/position
  case class FileContext(file: File, range: Range) extends ArrowContextBase {
    override def toInsertLocation: Option[InsertLocation] =
      Some(AsChildOf(file, range.start))
  }

  //general context based on project
  case class ProjectContext(project: OpticProject) extends ArrowContextBase {
    override def toInsertLocation: Option[InsertLocation] = None
  }

  //more advanced context with file context & models
  case class ModelContext(file: File, range: Range, models: Vector[ModelNode]) extends ArrowContextBase {
    override def toInsertLocation: Option[InsertLocation] = {
      Some(AsChildOf(file, range.end + 1))
    }
  }

}
