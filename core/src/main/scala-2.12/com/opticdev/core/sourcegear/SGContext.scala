package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.actors.{ActorCluster, ParseSupervisorSyncAccess}
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers.{AstGraph, ParserBase}

case class SGContext(fileAccumulator: FileAccumulator,
                     astGraph: AstGraph,
                     parser: ParserBase,
                     fileContents: String
                    )


object SGContext {
  def forModelNode(modelNode: BaseModelNode)(implicit actorCluster: ActorCluster, project: OpticProject) : Option[SGContext] = {
    implicit val sourceGear = project.projectSourcegear
    val file = modelNode.fileNode.get.toFile
    ParseSupervisorSyncAccess.getContext(file)
  }
}