package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sdk.descriptions.SchemaId
import com.opticdev.core.sourcegear.SourceGearContext
import com.opticdev.core.sourcegear.gears.helpers.FlattenModelFields
import com.opticdev.core.sourcegear.graph.{YieldsModelProperty, YieldsProperty}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.JsObject


sealed abstract class BaseModelNode(implicit sourceGearContext: SourceGearContext) extends BaseNode {
  val schemaId : SchemaId
  val value : JsObject

  lazy val expandedValue = {
    val listenersOption = sourceGearContext.fileAccumulator.listeners.get(schemaId)
    if (listenersOption.isDefined) {
      val modelFields = listenersOption.get.flatMap(i=> i.collect(sourceGearContext.astGraph))
      FlattenModelFields.flattenFields(modelFields, value)
    } else {
      value
    }
  }
}

case class LinkedModelNode(schemaId: SchemaId, value: JsObject, mapping: ModelAstMapping) (implicit sourceGearContext: SourceGearContext) {
  def flatten = ModelNode(schemaId, value)
}

case class ModelNode(schemaId: SchemaId, value: JsObject) (implicit sourceGearContext: SourceGearContext) extends BaseModelNode {

  def resolve : LinkedModelNode = {
    implicit val astGraph = sourceGearContext.astGraph
    val mapping : ModelAstMapping = astGraph.get(this).labeledDependencies.filter(_._1.isInstanceOf[YieldsModelProperty]).map {
      case (edge, node) => {
        edge match {
          case property: YieldsModelProperty =>
            property match {
              case YieldsProperty(path, relationship) => (path, Node(node.asInstanceOf[AstPrimitiveNode], relationship))
            }
        }
      }
    }.toMap

    LinkedModelNode(schemaId, value, mapping)
  }
}
