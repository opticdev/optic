package com.opticdev.server.data

import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import play.api.libs.json.{JsNumber, JsObject, JsString}

object ModelNodeJsonImplicits {

  implicit class ModelNodeJson(modelNode: LinkedModelNode) {

    def asJson : JsObject = {

      implicit val SGContext = modelNode.project

      JsObject(Seq(
        "id" -> JsString(modelNode.id),
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
