package com.opticdev.server.http.routes.query

import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.Description
import com.opticdev.parsers.graph.path.PropertyPathWalker
import play.api.libs.json.{JsError, JsSuccess, _}

trait ValuePredicate extends QueryComponent

case class Equals(propertyPath: Seq[String], value: JsValue) extends ValuePredicate {
  override def evaluate(linkedModelNode: LinkedModelNode[CommonAstNode]): Boolean = {
    val propertyValueOption = new PropertyPathWalker(linkedModelNode.value).getProperty(propertyPath)
    if (propertyValueOption.isDefined) propertyValueOption.get == value else false
  }
}
case class NotEqual(propertyPath: Seq[String], value: JsValue) extends ValuePredicate {
  override def evaluate(linkedModelNode: LinkedModelNode[CommonAstNode]): Boolean = {
    val propertyValueOption = new PropertyPathWalker(linkedModelNode.value).getProperty(propertyPath)
    if (propertyValueOption.isDefined) propertyValueOption.get != value else false
  }
}
case class OneOf(propertyPath: Seq[String], values: Set[JsValue]) extends ValuePredicate {
  override def evaluate(linkedModelNode: LinkedModelNode[CommonAstNode]): Boolean = {
    val propertyValueOption = new PropertyPathWalker(linkedModelNode.value).getProperty(propertyPath)
    if (propertyValueOption.isDefined) values.contains(propertyValueOption.get) else false
  }
}

object ValuePredicate extends Description[ValuePredicate] {

  implicit val valuePredicateReads: Reads[ValuePredicate] = (json: JsValue) => {
    try {
      JsSuccess(fromJson(json))
    } catch {
      case _ => JsError()
    }
  }

  override def fromJson(jsValue: JsValue): ValuePredicate = {
    jsValue match {
      case jsObject : JsObject => {
        val key = (jsObject \ "key").get.as[JsString].value.split("\\.").toSeq
        val value = jsObject \ "value"
        val values = jsObject \ "values"
        (jsObject \ "op").get.as[JsString].value.toLowerCase match {
          case "oneof" => OneOf(key, values.get.as[JsArray].value.toSet)
          case "==" => Equals(key, value.get)
          case "!=" => NotEqual(key, value.get)
        }
      }
      case _ => throw new Error("Value predicates must be objects")
    }
  }
}