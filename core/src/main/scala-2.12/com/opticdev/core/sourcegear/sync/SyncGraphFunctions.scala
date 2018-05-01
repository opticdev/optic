package com.opticdev.core.sourcegear.sync

import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.BaseNode
import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.constrained._
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import scalax.collection.constrained.constraints.Acyclic
import scalax.collection.constrained.mutable.Graph
// import scalax.collection.constrained.constraints.Acyclic

import scala.util.Try
/*
Invalid States:
1. Multiple models with the same name -> None work, warnings generated
2. Sources that don't connect to a valid model name -> no edges, warnings generated
3. Circular dependencies -> no edges, warnings generated

 */

object SyncGraphFunctions {
  def updateSyncEdges(fileGraph: AstGraph, projectGraph: ProjectGraph)(implicit project: ProjectBase) : UpdateResults = {
    implicit val actorCluster = project.actorCluster
    val syncSubgraph: ProjectGraph = {
      implicit val conf: Config = Acyclic
      val filtered = projectGraph.filter(projectGraph.having(edge = (e) => e.isLabeled && e.label.isInstanceOf[DerivedFrom]))
      Graph(filtered.edges:_*)
    }

    val warnings = scala.collection.mutable.ListBuffer[() => SyncWarning]()
    var validTargets = 0

    def hasName(baseNode: BaseNode) = baseNode.isInstanceOf[BaseModelNode] && baseNode.asInstanceOf[BaseModelNode].objectRef.isDefined
    def hasSource(baseNode: BaseNode) = baseNode.isInstanceOf[BaseModelNode] && baseNode.asInstanceOf[BaseModelNode].sourceAnnotation.isDefined

    val newFileDefinesNames = fileGraph.nodes.collect { case i if hasName(i) => i.value.asInstanceOf[BaseModelNode]}
    val newFileDefinesSources = fileGraph.nodes.collect { case i if hasSource(i) => i.value.asInstanceOf[BaseModelNode]}

    val pgDefinesNames = fileGraph.nodes.collect { case i if hasName(i) => i.value.asInstanceOf[BaseModelNode]}
    val pgDefinesSources = fileGraph.nodes.collect { case i if hasSource(i) => i.value.asInstanceOf[BaseModelNode]}

    val allNames = {
      val an = newFileDefinesNames ++ pgDefinesNames
      val duplicates = an.groupBy(_.objectRef.get.name).filter(_._2.size > 1).keys
      duplicates.foreach(dup=> warnings += {
        () => DuplicateSourceName(dup, Try(an.map(_.resolved().toDebugLocation).toSeq).getOrElse(Seq()))
      })
      an.filterNot(_.objectRef.exists(i=> duplicates.exists(_ == i.name)))
    }

    val newNames = newFileDefinesNames.map(_.objectRef.get.name)

    //add sources from new files
    //connect any targets from pg to newly defined names
    val unifiedTargets = newFileDefinesSources ++ pgDefinesSources.filter(t => newNames.contains(t.sourceAnnotation.get.sourceName))
    unifiedTargets
    .foreach(targetNode=> {
      val sourceAnnotation = targetNode.sourceAnnotation.get
      val sourceName = sourceAnnotation.sourceName
      val sourceNodeOption = allNames.find(_.objectRef.exists(_.name == sourceName))

      if (sourceNodeOption.isDefined) {
        validTargets += 1
        val didAdd = syncSubgraph add (sourceNodeOption.get ~+#> targetNode)(DerivedFrom())
        if (!didAdd) {
          warnings += {
            () => CircularDependency(sourceName, Try(targetNode.resolved().toDebugLocation).getOrElse(defaultAstDebugLocation))
          }
        }
      } else {
        warnings += {
          () => SourceDoesNotExist(sourceName, Try(targetNode.resolved().toDebugLocation).getOrElse(defaultAstDebugLocation))
        }
      }
    })

    projectGraph ++= syncSubgraph

    UpdateResults(allNames.size, validTargets, warnings.map(_.apply()), projectGraph)
  }

}
