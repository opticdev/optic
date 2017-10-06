package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sdk.descriptions.SchemaId
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.gears.helpers.FlattenModelFields
import com.opticdev.core.sourcegear.gears.parsing.ParseGear
import com.opticdev.core.sourcegear.graph.edges.{YieldsModel, YieldsModelProperty, YieldsProperty}
import com.opticdev.core.sourcegear.graph.AstProjection
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.JsObject
import com.opticdev.core.utils.UUID


sealed abstract class BaseModelNode(implicit sourceGearContext: SGContext) extends AstProjection {
  val schemaId : SchemaId
  val value : JsObject

  lazy val expandedValue = {
    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(schemaId)
    if (listenersOption.isDefined) {
      val modelFields = listenersOption.get.flatMap(i => i.collect(sourceGearContext.astGraph))
      FlattenModelFields.flattenFields(modelFields, value)
    } else {
      value
    }
  }
}

case class LinkedModelNode(schemaId: SchemaId, value: JsObject, mapping: ModelAstMapping, parseGear: ParseGear)(implicit sourceGearContext: SGContext) {
  def flatten = ModelNode(schemaId, value)
}

case class ModelNode(schemaId: SchemaId, value: JsObject) (implicit sourceGearContext: SGContext) extends BaseModelNode {

  def resolve : LinkedModelNode = {
    implicit val astGraph = sourceGearContext.astGraph
    val mapping : ModelAstMapping = astGraph.get(this).labeledDependencies.filter(_._1.isInstanceOf[YieldsModelProperty]).map {
      case (edge, node) => {
        edge match {
          case property: YieldsModelProperty =>
            property match {
              case YieldsProperty(path, relationship) => (path, NodeMapping(node.asInstanceOf[AstPrimitiveNode], relationship))
            }
        }
      }
    }.toMap

    val parseGear = astGraph.get(this).labeledDependencies.find(_._1.isInstanceOf[YieldsModel]).get._1.asInstanceOf[YieldsModel].withParseGear

    LinkedModelNode(schemaId, value, mapping, parseGear)
  }

  val identifier: String = UUID.generate

}
