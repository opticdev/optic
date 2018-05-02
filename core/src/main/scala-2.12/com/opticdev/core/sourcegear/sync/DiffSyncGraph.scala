package com.opticdev.core.sourcegear.sync

import com.opticdev.core.sourcegear.{Render, SGContext, SourceGear}
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.parsers.graph.BaseNode
import com.opticdev.sdk.RenderOptions
import com.opticdev.sdk.descriptions.transformation.Transformation
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.concurrent.ExecutionContext.Implicits.global
import scala.collection.mutable
import scala.concurrent.Future
import scala.util.Try


///only call from a project actor

object DiffSyncGraph {

  def calculateDiff(implicit project: ProjectBase, includeNoChange: Boolean = false) : Diffs = {
    val projectGraph = project.projectGraph

    implicit val actorCluster = project.actorCluster
    implicit val sourceGear = project.projectSourcegear
    implicit val graph: Graph[BaseNode, LkDiEdge] = SyncGraphFunctions.getSyncSubgraph(projectGraph).asInstanceOf[Graph[BaseNode, LkDiEdge]]

    val startingNodes= graph.nodes.collect { case n if n.dependencies.isEmpty => n.value.asInstanceOf[BaseModelNode] }.toVector

    def compareFuturesAlongPath(sourceNode: BaseModelNode, predecessorDiff: Option[SyncDiff] = None) : Vector[SyncDiff] = {
      val sourceValue = {
        if (predecessorDiff.exists(_.newValue.isDefined)) {
          predecessorDiff.get.newValue.get
        } else {
          implicit val sourceGearContext: SGContext = sourceNode.getContext().get
          sourceNode.expandedValue()
        }
      }
      sourceNode.labeledDependents.toVector.flatMap {
        case (label: DerivedFrom, targetNode: BaseModelNode) => {

          val diff = {
            val extractValuesTry = for {
              transformation <- Try(sourceGear.findTransformation(label.transformationRef).get)
              transformationResult <- transformation.transformFunction.transform(sourceValue, label.askAnswers)
              currentValue <- Try {
                implicit val sourceGearContext: SGContext = targetNode.getContext().get
                targetNode.expandedValue()
              }
              expectedValue <- Try {
                val stagedNode = transformationResult.toStagedNode(Some(RenderOptions(
                  lensId = Some(targetNode.lensRef.full)
                )))
                val prefixedFlatContent = sourceGear.flatContext.prefix(transformation.packageId.packageId)
                val generatedNode = Render.fromStagedNode(stagedNode)(sourceGear, prefixedFlatContent).get
                generatedNode._3.renderer.parseAndGetModel(generatedNode._2)(sourceGear, prefixedFlatContent).get
              }
            } yield (expectedValue, currentValue)

            if (extractValuesTry.isSuccess) {
              val (expectedValue, currentValue) = extractValuesTry.get
              if (expectedValue == currentValue) {
                NoChange(label)
              } else {
                Replace(label, currentValue, expectedValue)
              }
            } else {
              ErrorEvaluating(label, extractValuesTry.failed.get.getMessage)
            }

          }

          Vector(diff) ++ compareFuturesAlongPath(targetNode, Some(diff))

        }
        case _ => Vector()   ///should never be hit
      }
    }

    Diffs(startingNodes.flatMap(i=> compareFuturesAlongPath(i)).filterNot(i=> i.isInstanceOf[NoChange] && !includeNoChange ):_*)
  }

}
