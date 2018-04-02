package com.opticdev.core.sourcegear

import akka.actor.ActorRef
import better.files.File
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.core.sourcegear.project.status.ImmutableProjectStatus
import play.api.libs.json.{JsObject, JsString}

package object project {
  case class ProjectInfo(name: String, baseDir: String, status: ImmutableProjectStatus) {
    def asJson : JsObject = JsObject(Seq("name" -> JsString(name), "directory" -> JsString(baseDir), "status" -> status.asJson))
  }

  trait ProjectBase {
    val name: String
    val projectActor: ActorRef
    val projectStatus: ImmutableProjectStatus
    val filesStateMonitor : FileStateMonitor
    def projectSourcegear : SourceGear
    def projectGraph: ProjectGraph
    def shouldWatchFile(file: File) : Boolean
  }

}
