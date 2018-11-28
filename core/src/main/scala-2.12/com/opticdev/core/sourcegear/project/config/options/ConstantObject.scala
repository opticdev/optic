package com.opticdev.core.sourcegear.project.config.options

import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import net.jcazevedo.moultingyaml.YamlObject
import play.api.libs.json.JsObject

case class ConstantObject(name: String, `type`: Option[SchemaRef] = None, value: OpticConfigValue) {
  def schemaRef = `type`
  def isValid(implicit sourceGear: SourceGear) =
    if (`type`.isDefined) sourceGear.findSchema(`type`.get).exists(_.validate(value.toJson)) else true
  def toObjectNode = ObjectNode(name, `type`, value.toJson)
}