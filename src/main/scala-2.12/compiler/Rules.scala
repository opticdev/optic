package compiler

import cognitro.parsers.GraphUtils.Path.WalkablePath
import compiler.JsUtils.{dot, jsValueAsJsString, doubleQuotes}
import play.api.libs.json.JsValue

sealed trait RuleValue
case class Equals(contents: JsValue) extends RuleValue
case class EqualToVariable(variableName: String) extends RuleValue
case class EqualsRaw(raw: String) extends RuleValue
case class OneOf(set: Set[JsValue]) extends RuleValue
case class AnyValue() extends RuleValue
case class SharedValue(key: String) extends RuleValue

sealed trait Rules

case class PropertyRule(walkablePath: WalkablePath, propertyPath: String, value: RuleValue) extends Rules {
  def jsCode(stub: NodeStub, jsValue: JsValue) : String = {
    value match {
      case a: AnyValue => null
      case SharedValue(key) => "Shared.value("+doubleQuotes(key)+", "+dot(stub.name, "properties", propertyPath)+")"
      case EqualToVariable(name) => dot(stub.name, "properties", propertyPath)+" === "+ name
      case default => dot(stub.name, "properties", propertyPath)+" === "+ jsValueAsJsString(jsValue)
    }
  }
}
