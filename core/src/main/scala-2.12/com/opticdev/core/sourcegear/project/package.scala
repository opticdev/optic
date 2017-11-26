package com.opticdev.core.sourcegear

import com.opticdev._
import akka.actor.{ActorRef, Kill, PoisonPill, Props}
import better.files.File
import better.files._
import FileWatcher._
import java.nio.file.{Path, WatchEvent, StandardWatchEventKinds => EventType}

import akka.pattern.ask
import akka.stream.Supervision.Stop
import akka.util.Timeout
import com.opticdev.core.actorSystem

import concurrent.duration._
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import play.api.libs.json.{JsObject, JsString, JsValue}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Await


package object project {

  abstract class OpticProject(val name: String, val baseDirectory: File)(implicit actorCluster: ActorCluster) {

    import com.opticdev.core.sourcegear.actors._

    val projectActor = actorCluster.newProjectActor

    val watcher: ActorRef = baseDirectory.newWatcher(recursive = true)

    def projectFileChanged(newPf: ProjectFile) : Unit
    val projectFile = new ProjectFile(baseDirectory / "optic.yaml", createIfDoesNotExist = true, onChanged = projectFileChanged)

    def projectSourcegear : SourceGear

    def watch = {
      implicit val sourceGear = projectSourcegear
      watchedFiles.foreach(i=> projectActor ! FileCreated(i, this))
      watcher ! when(events = EventType.ENTRY_CREATE, EventType.ENTRY_MODIFY, EventType.ENTRY_DELETE)(handleFileChange)
    }

    val handleFileChange : better.files.FileWatcher.Callback = {
      case (EventType.ENTRY_CREATE, file) => {
        implicit val sourceGear = projectSourcegear
        updateWatchedFiles
        if (watchedFiles.contains(file)) projectActor ! FileCreated(file, this)
      }
      case (EventType.ENTRY_MODIFY, file) => {
        implicit val sourceGear = projectSourcegear
        if (file === projectFile.file) {
          projectFile.reload
        } else {
          if (watchedFiles.contains(file)) projectActor ! FileUpdated(file, this)
        }
      }
      case (EventType.ENTRY_DELETE, file) => {
        implicit val sourceGear = projectSourcegear
        if (watchedFiles.contains(file)) projectActor ! FileDeleted(file, this)
        updateWatchedFiles
      }
    }

    def projectGraph = {
      implicit val timeout = Timeout(2 seconds)
      val future = projectActor ? CurrentGraph
      Await.result(future, timeout.duration).asInstanceOf[ProjectGraphWrapper].projectGraph
    }


    def stopWatching = {
      actorSystem.stop(watcher)
    }

    private var watchedFilesStore : Set[File] = Set()
    def watchedFiles = watchedFilesStore
    def updateWatchedFiles: Set[File] = {
      val filesToWatch = baseDirectory.listRecursively.toVector.filter(i=>
        i.isRegularFile &&
          i.extension.isDefined && projectSourcegear.validExtensions.contains(i.extension.get)
      ).toSet
      watchedFilesStore = filesToWatch
      watchedFilesStore
    }

    def asJson = JsObject(Seq(
      "name" -> JsString(name),
      "directory" -> JsString(baseDirectory.pathAsString)
    ))

  }

}
