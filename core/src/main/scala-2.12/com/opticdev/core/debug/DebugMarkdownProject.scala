package com.opticdev.core.debug

import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.{ActorCluster, CurrentGraph, FileUpdated, FileUpdatedInMemory}
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.project.ProjectBase
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.core.sourcegear.project.status.{ProjectStatus, _}
import com.opticdev.core.sourcegear.sync.SyncPatch
import com.opticdev.parsers.AstGraph
import com.opticdev.sdk.descriptions.{Lens, PackageExportable}

import scala.collection.immutable
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.util.Try

case class DebugMarkdownProject(implicit logToCli: Boolean = false, actorCluster: ActorCluster) extends ProjectBase {

  val name: String = "_internal:DEBUG_PROJECT"

  val projectActor: ActorRef = actorCluster.newProjectActor()(project = this)

  protected val projectStatusInstance: ProjectStatus = new ProjectStatus(_configStatus = ValidConfig, _sourceGearStatus = Valid)
  val projectStatus = projectStatusInstance.immutable

  override def projectSourcegear: SourceGear = DebugSourceGear

  def projectGraph: ProjectGraph = {
    implicit val timeout = Timeout(2 seconds)
    val future = projectActor ? CurrentGraph
    Await.result(future, timeout.duration).asInstanceOf[ProjectGraphWrapper].projectGraph
  }

  def touchFile(file: File): Unit = {
    if (shouldWatchFile(file)) {
      projectActor ! FileUpdated(file, this)(projectSourcegear)
    }
  }

  def graphForFile(file: File): Future[Option[ProjectGraph]] = {
    if (shouldWatchFile(file)) {
      implicit val timeout: akka.util.Timeout = Timeout(1 minute)
      val future = projectActor ? FileUpdated(file, this)(projectSourcegear)
      future.map(f=> f.asInstanceOf[ProjectGraphWrapper].subgraphForFile(file))
    } else {
      Future.successful(None)
    }
  }

  def contextFor(file: File, range: Range): Future[Option[DebugInfo]] = {

    implicit val project = this
    graphForFile(file).map(i=> {
      if (i.isDefined) {
        val fileGraph = i.get
        val o = fileGraph.nodes.toVector.filter(i=> i.isNode && i.value.isInstanceOf[ModelNode])
          .map(_.value.asInstanceOf[ModelNode])
        val resolved: Seq[LinkedModelNode[DebugAstNode[PackageExportable]]] = o.map(_.resolve[DebugAstNode[PackageExportable]]())

        //Unlike a normal context query ONLY 1 result is possible. Hardcoding singular
        resolved.find(node => (node.root.range intersect range.inclusive).nonEmpty).flatMap(found => {
          found.root.sdkObject match {
            case l: Lens => Try(LensDebug.run(l, found.root.packageContext)).toOption
            case _ => None
          }
        })
      } else {
        None
      }
    })
  }

  override def shouldWatchFile(file: File): Boolean =
    file.extension(includeDot = false).contains("md")

  override val filesStateMonitor: FileStateMonitor = new FileStateMonitor()

  def stageFileContents(file: File, contents: String): Future[Any] = {
    implicit val timeout: akka.util.Timeout = Timeout(10 seconds)
    filesStateMonitor.stageContents(file, contents)
    projectActor ? FileUpdatedInMemory(file, contents, this)(projectSourcegear)
  }

  override def syncPatch: Future[SyncPatch] = Future(SyncPatch(Vector(), Vector()))

}
