package com.opticdev.core.sourcegear.project

import com.opticdev._
import akka.actor.{ActorRef, Kill, PoisonPill, Props}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import better.files._
import FileWatcher._
import java.nio.file.{Path, WatchEvent, StandardWatchEventKinds => EventType}

import akka.stream.Supervision.Stop
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import play.api.libs.json.{JsObject, JsString}

class Project(val name: String, val baseDirectory: File, implicit var sourceGear: SourceGear = SourceGear.default)(implicit logToCli: Boolean = false) {

  import com.opticdev.core.sourcegear.actors._
  private var watcher: ActorRef = baseDirectory.newWatcher(recursive = true)
  val projectActor = actorSystem.actorOf(ProjectActor.props(ProjectGraphWrapper.empty))

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