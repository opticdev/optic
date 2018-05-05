package com.opticdev.core.sourcegear.sync

import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph, ProjectGraphWrapper, SyncGraph}
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.BaseNode
import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.constrained._
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import scalax.collection.GraphPredef
import scalax.collection.constrained.constraints.Acyclic
import scalax.collection.constrained.mutable.Graph
// import scalax.collection.constrained.constraints.Acyclic

import scala.util.Try

//only call from a project actor

/*
Invalid States:
1. Multiple models with the same name -> None work, warnings generated
2. Sources that don't connect to a valid model name -> no edges, warnings generated
3. Circular dependencies -> no edges, warnings generated

 */

object SyncGraph {

  def emptySyncGraph: SyncGraph = {
    implicit val conf: Config = Acyclic
    Graph()
  }

  def syncGraphFromProjectGraph(pg: ProjectGraph) = pg.filter(pg.having(edge = (e) => e.isLabeled && e.label.isInstanceOf[DerivedFrom]))

  def getSyncGraph(projectGraph: ProjectGraph)(implicit project: ProjectBase) : SyncSubGraph = {
    implicit val actorCluster = project.actorCluster
    val syncSubgraph = emptySyncGraph
    val warnings = scala.collection.mutable.ListBuffer[() => SyncWarning]()
    var validTargets = 0

    def hasName(baseNode: BaseNode) = baseNode.isInstanceOf[BaseModelNode] && baseNode.asInstanceOf[BaseModelNode].objectRef.isDefined
    def hasSource(baseNode: BaseNode) = baseNode.isInstanceOf[BaseModelNode] && baseNode.asInstanceOf[BaseModelNode].sourceAnnotation.isDefined

    val pgDefinesNames = projectGraph.nodes.collect { case i if hasName(i) => i.value.asInstanceOf[BaseModelNode]}
    val pgDefinesSources = projectGraph.nodes.collect { case i if hasSource(i) => i.value.asInstanceOf[BaseModelNode]}

    val allNames = {
      val an = pgDefinesNames
      val duplicates = an.groupBy(_.objectRef.get.name).filter(_._2.size > 1).keys
      duplicates.foreach(dup=> warnings += {
        () => DuplicateSourceName(dup, Try(an.map(_.resolved().toDebugLocation).toVector).getOrElse(Vector()))
      })
      an.filterNot(_.objectRef.exists(i=> duplicates.exists(_ == i.name)))
    }

    val unifiedTargets = pgDefinesSources
    unifiedTargets
    .foreach(targetNode=> {
      val sourceAnnotation = targetNode.sourceAnnotation.get
      val sourceName = sourceAnnotation.sourceName
      val sourceNodeOption = allNames.find(_.objectRef.exists(_.name == sourceName))

      if (sourceNodeOption.isDefined) {
        validTargets += 1
        val didAdd = syncSubgraph add (sourceNodeOption.get ~+#> targetNode)(DerivedFrom(sourceAnnotation.transformationRef, sourceAnnotation.askObject))
        if (!didAdd) {
          warnings += {
            () => CircularDependency(sourceName, targetNode.resolved().toDebugLocation)
          }
        }
      } else {
        warnings += {
          () => SourceDoesNotExist(sourceName, targetNode.resolved().toDebugLocation)
        }
      }
    })

    SyncSubGraph(allNames.size, validTargets, warnings.map(_.apply()).toVector, projectGraph ++ syncSubgraph)
  }

}
