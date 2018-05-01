package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.graph.ProjectGraph

package object sync {

  case class UpdateResults(sources: Int, targets: Int, warnings: Seq[SyncWarning], graph: ProjectGraph) {
    def noWarnings : Boolean = warnings.isEmpty
  }

  sealed trait SyncWarning
  case class DuplicateSourceName(name: String, locations: Seq[AstDebugLocation]) extends SyncWarning
  case class SourceDoesNotExist(missingSource: String, location: AstDebugLocation) extends SyncWarning
  case class CircularDependency(targeting: String, location: AstDebugLocation) extends SyncWarning


  val defaultAstDebugLocation = AstDebugLocation("Unknown File", Range(0,0))
}
