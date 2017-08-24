package sourcegear.rules

import play.api.libs.json.JsValue

trait RuleDesc[I] {
  def evaluate(input: I) : Boolean
}


/* Property Rules
*
*
* CompareTo a distinct JsValue (supports ==, !=, ANY)
* OneOf a set of possible JsValues
*
*
* */

case class PropertyRule(key: String, value: PropertyRuleValue) extends RuleDesc[JsValue] {
  def evaluate(jsValue: JsValue) : Boolean = value.evaluate(jsValue)
}

trait PropertyRuleValue {
  def evaluate(jsValue: JsValue) : Boolean
}

case class CompareTo(value: JsValue, comparator: String) extends PropertyRuleValue {
  override def evaluate(jsValue: JsValue): Boolean = comparator match {
    case "==" => jsValue == value
    case "!=" => jsValue != value
    case "ANY" => true
    case _=> false
  }
}

case class OneOf(set: Set[JsValue]) extends PropertyRuleValue {
  override def evaluate(jsValue: JsValue): Boolean = set.contains(jsValue)
}
