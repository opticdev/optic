package com.opticdev.core.sourcegear.sync

import com.opticdev.core.sourcegear.graph.{ProjectGraph, SyncGraph}
import com.opticdev.core.sourcegear.graph.edges.DerivedFrom
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.sourcegear.project.status.{ErrorSyncing, SyncPending, SyncStatus, UpToDate}
import com.opticdev.parsers.graph.BaseNode
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.concurrent.duration._
import scala.util.hashing.MurmurHash3

object SyncStatusManager {

//  def syncHashForProject(syncGraph: SyncGraph)(implicit project: ProjectBase): String = {
//    //hash all nodes
//    implicit val syncSubgraph= syncGraph.filter(syncGraph.having(edge = (e) => e.isLabeled && e.label.isInstanceOf[DerivedFrom]))
//
//    val hashes = syncSubgraph.edges.map(i=> {
//      val derivedFrom = i.label.asInstanceOf[DerivedFrom]
//      val from = i.from.value.asInstanceOf[BaseModelNode]
//      val to = i.to.value.asInstanceOf[BaseModelNode]
//
//      MurmurHash3.stringHash(from.hash + derivedFrom.hash + to.hash)
//    }).toSet
//
//    Integer.toHexString(MurmurHash3.setHash(hashes))
//  }

  def getStatus(projectGraph: ProjectGraph)(implicit project: ProjectBase) : SyncStatus = {
    val patch = DiffSyncGraph.calculateDiff(projectGraph)
    patch match {
      case p if p.containsErrors => ErrorSyncing(p.errors.map(_.toString).mkString(", "))
      case p if p.isEmpty => UpToDate
      case p if p.nonEmpty => SyncPending
    }
  }
}
