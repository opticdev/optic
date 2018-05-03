package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import play.api.libs.json.JsObject
import scalax.collection.edge.LkDiEdge

package object sync {

  case class UpdateResults(sources: Int, targets: Int, warnings: Vector[SyncWarning], graph: ProjectGraph) {
    def noWarnings : Boolean = warnings.isEmpty
  }

  sealed trait SyncWarning
  case class DuplicateSourceName(name: String, locations: Vector[AstDebugLocation]) extends SyncWarning
  case class SourceDoesNotExist(missingSource: String, location: AstDebugLocation) extends SyncWarning
  case class CircularDependency(targeting: String, location: AstDebugLocation) extends SyncWarning


  case class RangePatch(range: Range, newRaw: String, file: File, fileContents: String)
  case class FilePatch(file: File, newFileContents: String)

  sealed trait SyncDiff {
    val edge: DerivedFrom
    def newValue : Option[JsObject] = None
    def isError : Boolean = false
  }
  case class NoChange(edge: DerivedFrom) extends SyncDiff
  case class Replace(edge: DerivedFrom, before: JsObject, after: JsObject, rangePatch: RangePatch) extends SyncDiff { override def newValue = Some(after) }
  case class ErrorEvaluating(edge: DerivedFrom, error: String) extends SyncDiff { override def isError: Boolean = true }

}
