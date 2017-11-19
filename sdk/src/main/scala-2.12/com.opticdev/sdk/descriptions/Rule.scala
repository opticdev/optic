package com.opticdev.sdk.descriptions

import com.opticdev.sdk.PropertyValue
import com.opticdev.sdk.descriptions.finders.Finder
import play.api.libs.json.{JsError, JsSuccess, _}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import enums.RuleEnums._

object Rule extends Description[Rule] {

  import com.opticdev.sdk.PropertyValuesConversions._

  implicit val rawRule = Json.reads[RawRule]
  implicit val propertyRule = Json.reads[PropertyRule]
  implicit val childrenRule = Json.reads[ChildrenRule]

  implicit val ruleReads = new Reads[Rule] {
    override def reads(json: JsValue): JsResult[Rule] = {
      try {
        JsSuccess(Rule.fromJson(json))
      } catch {
        case _=> JsError()
      }
    }
  }

  override def fromJson(jsValue: JsValue): Rule = {

    val ruleType = jsValue \ "type"

    if (ruleType.isDefined && ruleType.get.isInstanceOf[JsString]) {

      val result: JsResult[Rule] = ruleType.get.as[JsString].value match {
        case "raw" => Json.fromJson[RawRule](jsValue)
        case "property" => Json.fromJson[PropertyRule](jsValue)
        case "children" => Json.fromJson[ChildrenRule](jsValue)
        case _ => throw new Error("Rule Parsing Failed. Invalid Type " + ruleType.get)
      }

      if (result.isSuccess) {
        result.get
      } else {
        throw new Error("Rule Parsing Failed " + result)
      }

    } else {
      throw new Error("Rule Parsing Failed. Type not provided.")
    }

  }
}

sealed trait Rule {
  val finder: Finder
  val isRawRule = false
  val isPropertyRule = false
  val isChildrenRule = false
}

case class RawRule(finder: Finder, comparator: String, value: String = "") extends Rule {
  override val isRawRule = true
}

case class PropertyRule(finder: Finder, key: String, comparator: String, value: PropertyValue = null) extends Rule {
  override val isPropertyRule = true
}

case class ChildrenRule(finder: Finder, ruleType: ChildrenRuleTypeEnum) extends Rule {
  override val isChildrenRule = true
}