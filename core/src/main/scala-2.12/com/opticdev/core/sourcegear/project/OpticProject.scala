package com.opticdev.core.sourcegear.project

import java.nio.file.{StandardWatchEventKinds => EventType}

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import better.files.FileWatcher._
import better.files.{File, _}
import com.opticdev.core.actorSystem
import com.opticdev.core.sourcegear.project.status._
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.monitoring.{FileStateMonitor, ShouldWatch}
import com.opticdev.core.sourcegear.project.status.ProjectStatus
import com.opticdev.core.sourcegear.snapshot.Snapshot
import com.opticdev.core.sourcegear.sync.{DiffSyncGraph, SyncPatch}
import net.jcazevedo.moultingyaml.YamlString

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future, Promise}
import scala.concurrent.duration._
import scala.util.{Failure, Success}

abstract class OpticProject(val name: String, val baseDirectory: File)(implicit val actorCluster: ActorCluster) extends ProjectBase {

  import com.opticdev.core.sourcegear.actors._

  /* Project Actor setup */

  val projectActor: ActorRef = actorCluster.newProjectActor()(project = this)

  /* Private & public declarations of the project status & info */

  protected val projectStatusInstance: ProjectStatus = new ProjectStatus()
  val projectStatus: ImmutableProjectStatus = projectStatusInstance.immutable
  def projectInfo : ProjectInfo = ProjectInfo(name, baseDirectory.pathAsString, projectStatus)

  /* Normal Disk Monitoring */

  val watcher: ActorRef = baseDirectory.newWatcher(recursive = true)

  def projectFileChanged(newPf: ProjectFile) : Unit = {
    projectStatusInstance.touch
    if (newPf.interface.isSuccess) {
      projectStatusInstance.configStatus = ValidConfig
    } else {
      projectStatusInstance.configStatus = InvalidConfig(newPf.interface.failed.get.getMessage)
    }
  }

  val projectFile = new ProjectFile(baseDirectory / "optic.yml", onChanged = projectFileChanged)

  def projectSourcegear : SourceGear

  def onSourcegearChanged(callback: (SourceGear)=> Unit) : Unit = Unit

  def regenerateSourceGear(newPf: ProjectFile) : Unit = Unit

  def watch = {
    rereadAll
    watcher ! when(events = EventType.ENTRY_CREATE, EventType.ENTRY_MODIFY, EventType.ENTRY_DELETE)(handleFileChange)
    projectStatusInstance.monitoringStatus = Watching
  }

  def fullRefresh = {
    regenerateSourceGear(projectFile)
    rereadAll
  }

  def rereadAll = {
    implicit val timeout: akka.util.Timeout = Timeout(5 minutes)
    implicit val sourceGear = projectSourcegear
    //should delete all
    ProjectActorSyncAccess.clearGraph(projectActor)
    ProjectActorSyncAccess.addConnectedProjectSubGraphs(projectActor, sourceGear.connectedProjectGraphs)
    ParseSupervisorSyncAccess.clearCache()

    projectStatusInstance.firstPassStatus = InProgress

    val futures = filesToWatch.toSeq.map(i=> projectActor ? FileCreated(i, this))

    Future.sequence(futures).onComplete(i=> {
      projectStatusInstance.firstPassStatus = Complete
      projectStatusInstance.touch
    })
  }

  val handleFileChange : better.files.FileWatcher.Callback = {
    case (EventType.ENTRY_CREATE, file) => {
      implicit val sourceGear = projectSourcegear
      projectStatusInstance.touch
      filesStateMonitor.markUpdated(file)
      if (shouldWatchFile(file)) projectActor ! FileCreated(file, this)
    }
    case (EventType.ENTRY_MODIFY, file) => {
      implicit val sourceGear = projectSourcegear
      projectStatusInstance.touch
      filesStateMonitor.markUpdated(file)
      if (file.isSameFileAs(projectFile.file)) {
        projectFile.reload
      } else {
        if (shouldWatchFile(file)) projectActor ! FileUpdated(file, this)
      }
    }
    case (EventType.ENTRY_DELETE, file) => {
      implicit val sourceGear = projectSourcegear
      filesStateMonitor.markUpdated(file)
      projectStatusInstance.touch
      if (shouldWatchFile(file)) projectActor ! FileDeleted(file, this)
    }
  }

  def stopWatching = {
    actorSystem.stop(watcher)
    projectStatusInstance.monitoringStatus = NotWatching
  }

  def projectGraph: ProjectGraph = {
    implicit val timeout = Timeout(15 seconds)
    val future = projectActor ? CurrentGraph
    Await.result(future, timeout.duration).asInstanceOf[ProjectGraphWrapper].projectGraph
  }

  def projectGraphWrapper: ProjectGraphWrapper = {
    implicit val timeout = Timeout(15 seconds)
    val future = projectActor ? CurrentGraph
    Await.result(future, timeout.duration).asInstanceOf[ProjectGraphWrapper]
  }

  /* Staged File Monitor */
  val filesStateMonitor : FileStateMonitor = new FileStateMonitor()
  def stageFileContents(file: File, contents: String, fromContextQuery: Boolean = false): Future[Any] = {
    implicit val timeout: akka.util.Timeout = Timeout(10 seconds)
    filesStateMonitor.stageContents(file, contents)
    projectActor ? FileUpdatedInMemory(file, contents, this, fromContextQuery)(projectSourcegear)
  }

  /* Control logic for watching files */
  //@todo profile this. Seems liable to cause big slowdowns with many files running through it
  def shouldWatchFile(file: File) : Boolean = {
    if (projectSourcegear.isEmpty) return false
    ShouldWatch.file(file,
      projectSourcegear.validExtensions,
      projectFile.interface.get.primary.exclude.getOrElse(List()).map(i => File(baseDirectory.pathAsString +"/"+ i)) ++ projectSourcegear.excludedPaths.map(i => File(i)))
  }

  def filesToWatch : Set[File] = baseDirectory.listRecursively.toVector.filter(shouldWatchFile).toSet

  def snapshot: Future[Snapshot] = {
    implicit val timeout: akka.util.Timeout = Timeout(1 minute)
    (projectActor ? GetSnapshot(projectSourcegear, this)).mapTo[Future[Snapshot]].flatten
  }

  def syncPatch: Future[SyncPatch] = {
    implicit val timeout: akka.util.Timeout = Timeout(1 minute)
    snapshot.map(snapshot=> DiffSyncGraph.calculateDiff(snapshot)(this))
  }

}
