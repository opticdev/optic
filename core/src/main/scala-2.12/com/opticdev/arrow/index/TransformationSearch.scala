package com.opticdev.arrow.index
import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.arrow.results.TransformationResult
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.parsers.graph.CommonAstNode
import play.api.libs.json.JsString

import scala.util.Try
object TransformationSearch {

  def search(context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph, editorSlug: String, nodeKeyStore: NodeKeyStore) : Vector[TransformationResult] =
    context match {
      case m: ModelContext => m.models.flatMap(c=> {
        val transformations = knowledgeGraph.availableTransformations(c.schemaId)

        val sourceGearcontext = Try(sourceGearContext(c))
        val inputValue = Try {
          val jsObject = c.expandedValue(withVariables = true)(sourceGearcontext.get)
          if (c.objectRef.isDefined) {
            //add name if there is one
            jsObject + ("_name" -> JsString(c.objectRef.get.name))
          } else jsObject
        }.getOrElse(c.value)


        val modelId = Try {
          val file = sourceGearcontext.get.file
          nodeKeyStore.leaseId(file, c match {
            case mn: ModelNode => mn.resolveInGraph[CommonAstNode](sourceGearcontext.get.astGraph)
            case mmn: MultiModelNode => mmn
          })
        }.toOption

        //@todo rank based on usage over time...
        transformations.map(t=> TransformationResult(100, t, context, Some(inputValue), modelId, c.flatten.objectRef.map(_.name)))
      })
      case _ => Vector()
    }


  def sourceGearContext(modelNode: BaseModelNode)(implicit project: OpticProject) : SGContext = {
    implicit val sourceGear = project.projectSourcegear
    implicit val actorCluster = project.actorCluster
    val fileNode = modelNode.fileNode
    ParseSupervisorSyncAccess.getContext(fileNode.get.toFile).get
  }

}