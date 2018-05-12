package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.actors.{ActorCluster, ParseSupervisorSyncAccess}
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.parsers.{AstGraph, ParserBase, ParserRef}

case class SGContext(fileAccumulator: FileAccumulator,
                     astGraph: AstGraph,
                     parser: ParserBase,
                     fileContents: String,
                     sourceGear: SourceGear,
                     file: File
                    )


object SGContext {
  def forModelNode(modelNode: BaseModelNode)(implicit actorCluster: ActorCluster, project: ProjectBase) : Option[SGContext] = {
    implicit val sourceGear = project.projectSourcegear
    val file = modelNode.fileNode.get.toFile
    ParseSupervisorSyncAccess.getContext(file)
  }

  def forRender(sourceGear: SourceGear, astGraph: AstGraph, parserRef: ParserRef): SGContext = {
    SGContext(sourceGear.fileAccumulator, astGraph, sourceGear.findParser(parserRef).get, null, sourceGear, null)
  }

}