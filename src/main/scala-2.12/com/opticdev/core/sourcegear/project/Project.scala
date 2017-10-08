package com.opticdev.core.sourcegear.project

import com.opticdev._
import akka.actor.{ActorRef, Kill, PoisonPill, Props}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import better.files._
import FileWatcher._
import java.nio.file.{Path, WatchEvent, StandardWatchEventKinds => EventType}

import akka.pattern.ask
import akka.stream.Supervision.Stop
import akka.util.Timeout

import concurrent.duration._
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import play.api.libs.json.{JsObject, JsString, JsValue}

import scala.concurrent.Await

class Project(val name: String, val baseDirectory: File, implicit var sourceGear: SourceGear = SourceGear.default)(implicit logToCli: Boolean = false, actorCluster: ActorCluster) {

  import com.opticdev.core.sourcegear.actors._
  private var watcher: ActorRef = baseDirectory.newWatcher(recursive = true)
  val projectActor = actorCluster.newProjectActor

  def watch = {
    watchedFiles.foreach(i=> projectActor ! FileCreated(i))
    watcher ! when(events = EventType.ENTRY_CREATE, EventType.ENTRY_MODIFY, EventType.ENTRY_DELETE)(callback)
  }

  private val callback : better.files.FileWatcher.Callback = {
    case (EventType.ENTRY_CREATE, file) => {
      updateWatchedFiles
      if (watchedFiles.contains(file)) projectActor ! FileCreated(file)
    }
    case (EventType.ENTRY_MODIFY, file) => if (watchedFiles.contains(file)) projectActor ! FileUpdated(file)
    case (EventType.ENTRY_DELETE, file) => {
      if (watchedFiles.contains(file)) projectActor ! FileDeleted(file)
      updateWatchedFiles
    }
  }

  def updateModel(id: String, value: JsObject) = {
//    import ProjectActorImplicits._
//    val node = projectActor askForNode(id)
//    if (node.isDefined) {
//      import com.opticdev.core.sourcegear.mutate.MutationImplicits._
//      node.get
//        .asInstanceOf[ModelNode]
//        .resolve
//        .update(value)
//    } else throw new Error("Node with id "+id+" not found in project graph")
  }

  def projectGraph = {
    implicit val timeout = Timeout(1 second)
    val future = projectActor ? CurrentGraph
    Await.result(future, timeout.duration).asInstanceOf[ProjectGraphWrapper].projectGraph
  }

////
//  def stopWatching = {
//    watcher ! stop(EventType.ENTRY_CREATE, callback)
//    watcher ! PoisonPill
//  }


  private var watchedFilesStore : Set[File] = updateWatchedFiles
  def watchedFiles = watchedFilesStore
  def updateWatchedFiles: Set[File] = {
    val filesToWatch = baseDirectory.listRecursively.toVector.filter(i=>
      i.isRegularFile &&
      i.extension.isDefined && sourceGear.validExtensions.contains(i.extension.get)
    ).toSet
    watchedFilesStore = filesToWatch
    watchedFilesStore
  }

  def asJson = JsObject(Seq(
    "name" -> JsString(name),
    "directory" -> JsString(baseDirectory.pathAsString)
  ))
}