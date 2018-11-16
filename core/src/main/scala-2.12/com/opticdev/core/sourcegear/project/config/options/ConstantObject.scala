package com.opticdev.core.sourcegear.project.config.options

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import net.jcazevedo.moultingyaml.YamlObject
import play.api.libs.json.JsObject

case class ConstantObject(name: String, `type`: SchemaRef, value: OCObject) {
  def schemaRef = `type`
  def isValid(implicit sourceGear: SourceGear) =
    sourceGear.findSchema(`type`).exists(_.validate(value.toJson))

  def toObjectNode = ObjectNode(name, `type`, value.toJson.as[JsObject])
}