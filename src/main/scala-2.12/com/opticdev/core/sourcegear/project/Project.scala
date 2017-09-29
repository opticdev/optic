package com.opticdev.core.sourcegear.project

import akka.actor.{ActorRef, Kill, PoisonPill, Props}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import better.files._
import FileWatcher._
import java.nio.file.{Path, WatchEvent, StandardWatchEventKinds => EventType}

import com.opticdev.core.sourcegear.actors._

class Project(name: String, baseDirectory: File, var sourceGear: SourceGear = SourceGear.default) {

  import com.opticdev.core.sourcegear.actors._
  private val watcher: ActorRef = (baseDirectory).newWatcher(recursive = true)
  val projectActor = actorSystem.actorOf(Props[ProjectActor])

  def watch = {
    watcher ! when(events = EventType.ENTRY_CREATE, EventType.ENTRY_MODIFY, EventType.ENTRY_DELETE) {
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
  }

  def stopWatching = {
    watcher ! Kill
  }


  private var watchedFilesStore : Vector[File] = updateWatchedFiles
  def watchedFiles = watchedFilesStore
  def updateWatchedFiles: Vector[File] = {
    val filesToWatch = baseDirectory.listRecursively.toVector.filter(i=>
      i.isRegularFile &&
      i.extension.isDefined && sourceGear.validExtensions.contains(i.extension.get)
    )
    watchedFilesStore = filesToWatch
    watchedFilesStore
  }

}