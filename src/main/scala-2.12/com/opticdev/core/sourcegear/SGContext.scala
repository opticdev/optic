package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.actors.{ActorCluster, GetContext, ParseSupervisorActor, ParseSupervisorSyncAccess}
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.{AstGraph, ParserBase}

case class SGContext(fileAccumulator: FileAccumulator,
                     astGraph: AstGraph,
                     parser: ParserBase,
                     fileContents: String
                    )


object SGContext {
  def forModelNode(modelNode: ModelNode)(implicit actorCluster: ActorCluster, project: Project) : Option[SGContext] = {
    implicit val sourceGear = project.sourceGear
    val file = modelNode.fileNode.get.toFile
    ParseSupervisorSyncAccess.getContext(file)
  }
}