package com.opticdev.core.sourcegear

import com.opticdev.core.sourcegear.project.status.ImmutableProjectStatus
import play.api.libs.json.{JsObject, JsString}

package object project {
  case class ProjectInfo(name: String, baseDir: String, status: ImmutableProjectStatus) {
    def asJson : JsObject = JsObject(Seq("name" -> JsString(name), "directory" -> JsString(baseDir), "status" -> status.asJson))
  }
}
