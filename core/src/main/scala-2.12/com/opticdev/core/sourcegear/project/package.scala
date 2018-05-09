package com.opticdev.core.sourcegear

import akka.actor.ActorRef
import better.files.File
import com.opticdev.core.sourcegear.actors.ActorCluster
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.core.sourcegear.project.status.ImmutableProjectStatus
import com.opticdev.core.sourcegear.sync.SyncPatch
import play.api.libs.json.{JsObject, JsString}

import scala.concurrent.Future

package object project {
  case class ProjectInfo(name: String, baseDir: String, status: ImmutableProjectStatus) {
    def asJson : JsObject = JsObject(Seq("name" -> JsString(name), "directory" -> JsString(baseDir), "status" -> status.asJson))
  }

  trait ProjectBase {
    val name: String
    val baseDirectory: File
    val projectActor: ActorRef
    val projectStatus: ImmutableProjectStatus
    val filesStateMonitor : FileStateMonitor
    val actorCluster: ActorCluster
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

  }

}
