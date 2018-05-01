package com.opticdev.core.sourcegear.sync

import com.opticdev.core.sourcegear.{SGContext, SourceGear}
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

object DiffSyncGraph {

  private case class CompareResult(source: ModelNode, target: ModelNode, edge: DerivedFrom)

  def calculateDiff(implicit project: ProjectBase) = {
    val projectGraph = project.projectGraph

    implicit val actorCluster = project.actorCluster
    implicit val sourceGear = project.projectSourcegear
    implicit val graph: Graph[BaseNode, LkDiEdge] = SyncGraphFunctions.getSyncSubgraph(projectGraph).asInstanceOf[Graph[BaseNode, LkDiEdge]]

    val startingNodes= graph.nodes.collect { case n if n.dependencies.isEmpty => n.value.asInstanceOf[BaseModelNode] }

    def compareFuturesAlongPath(sourceNode: BaseModelNode) : Seq[Future[CompareResult]] = {
      val sourceValue = {
        implicit val sourceGearContext: SGContext = sourceNode.getContext().get
        sourceNode.expandedValue()
      }
      sourceNode.labeledDependents.flatMap {
        case (label: DerivedFrom, targetNode: BaseModelNode) => {
          val future =  {
            val transformationRef = label.transformationRef
            val transformation: Transformation = sourceGear.findTransformation(transformationRef).get
            val transformationTry = transformation.transformFunction.transform(sourceValue, label.askAnswers)

            println(transformationTry)

            println(sourceValue)
//            transformation.get.transformFunction.
          }
          Seq()
        }
        case _ => Seq()   ///should never be hit
      }
      Seq()
    }

    startingNodes.flatMap(compareFuturesAlongPath)

    println(startingNodes)


  }

}
