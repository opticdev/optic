package com.opticdev.core.sourcegear.graph.model

import com.opticdev.core.sdk.descriptions.SchemaId
import com.opticdev.core.sourcegear.graph.{YieldsModelProperty, YieldsProperty}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.JsObject


sealed trait BaseModelNode extends BaseNode {
  val schemaId : SchemaId
  var value : JsObject
}

case class LinkedModelNode(schemaId: SchemaId, var value: JsObject, mapping: ModelAstMapping) {
  def flatten = ModelNode(schemaId, value)
}

case class ModelNode(schemaId: SchemaId, var value: JsObject) extends BaseModelNode {
  def silentUpdate(newVal: JsObject) = value = newVal
  def resolve(implicit astGraph: AstGraph) : LinkedModelNode = {

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
