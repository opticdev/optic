package com.opticdev.core.sourcegear

import akka.actor.ActorRef
import better.files.File
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.{FileNode, NamedFile, NamedModel, ProjectGraph, SerializeProjectGraph}
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.core.sourcegear.project.status.{ImmutableProjectStatus, ProjectStatus}
import com.opticdev.core.sourcegear.storage.ConnectedProjectGraphStorage
import com.opticdev.core.sourcegear.sync.SyncPatch
import play.api.libs.json.{JsObject, JsString}

import scala.concurrent.Future

package object project {
  case class ProjectInfo(name: String, baseDir: String, status: ImmutableProjectStatus = new ImmutableProjectStatus(new ProjectStatus())) {
    def asJson : JsObject = JsObject(Seq("name" -> JsString(name), "directory" -> JsString(baseDir), "status" -> status.asJson))
  }

  trait ProjectBase {
    val name: String
    val baseDirectory: File
    val projectActor: ActorRef
    val projectStatus: ImmutableProjectStatus
    val filesStateMonitor : FileStateMonitor
    val actorCluster: ActorCluster

    implicit val nodeKeyStore: NodeKeyStore = new NodeKeyStore

    def projectSourcegear : SourceGear
    def projectGraph: ProjectGraph
    def syncPatch: Future[SyncPatch]
    def shouldWatchFile(file: File) : Boolean

    def trimAbsoluteFilePath(filePath: String) = {
      val split = filePath.split(baseDirectory.pathAsString)
      if (split.size == 2 && split(0).isEmpty) {
        split(1)
      } else {
        filePath
      }
    }


    //callbacks on main thread
    private var _updatedModelNodeOptionsCallbacks = Set[(Set[NamedModel], Set[NamedFile])=> Unit]()
    def hasUpdatedModelNodeOptionsCallbacks = _updatedModelNodeOptionsCallbacks.nonEmpty
    def callOnUpdatedModelNodeOptions(modelNodes: Set[NamedModel], fileNodes: Set[NamedFile]) = _updatedModelNodeOptionsCallbacks.foreach(_.apply(modelNodes, fileNodes))
    def onUpdatedModelNodeOptions(callback: (Set[NamedModel], Set[NamedFile])=> Unit) = {
      _updatedModelNodeOptionsCallbacks += callback
    }

    def publishProjectGraph = {
      import SerializeProjectGraph._
      import scala.concurrent.ExecutionContext.Implicits.global
      SerializeProjectGraph.fromProject(this).map(pg => ConnectedProjectGraphStorage.writeToStorage(name, pg.toJson))
    }

  }

}
