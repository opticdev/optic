package com.opticdev.server.data

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsNumber, JsObject, JsString}

object ModelNodeJsonImplicits {

  implicit class ModelNodeJson(modelNode: LinkedModelNode) {

    def asJson()(implicit projectsManager: ProjectsManager) : JsObject = {

      val fileNode = modelNode.fileNode

      JsObject(Seq(
        "id" -> JsString(projectsManager.nodeKeyStore.leaseId(fileNode.get.toFile, modelNode)),
        "schemaId" -> JsString(modelNode.schemaId.id),
        "astLocation" -> JsObject(Seq(
          "type" -> JsString(modelNode.root.nodeType.asString),
          "start" -> JsNumber(modelNode.root.range.start),
          "end" -> JsNumber(modelNode.root.range.end)
        )),
        //@todo make this exapanded context
        "value" -> modelNode.value
      ))

    }

  }

}
