package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.project.status.ImmutableProjectStatus
import play.api.libs.json.{JsObject, JsString}

package object project {
  case class ProjectInfo(name: String, baseDir: String, status: ImmutableProjectStatus) {
    def asJson : JsObject = JsObject(Seq("name" -> JsString(name), "directory" -> JsString(baseDir), "status" -> status.asJson))
  }

  trait ProjectBase {
    val name: String
    val projectStatus: ImmutableProjectStatus
    def projectSourcegear : SourceGear
    def projectGraph: ProjectGraph
    def shouldWatchFile(file: File) : Boolean
  }

}
