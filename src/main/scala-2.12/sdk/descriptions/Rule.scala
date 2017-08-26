package sdk.descriptions

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.{JsError, JsSuccess, _}
import sdk.descriptions.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}
import sdk.descriptions.helpers.{EnumReader, ParsableEnum}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object Rule extends Description[Rule] {

  private implicit val childrenRuleTypeReads = EnumReader.forEnum(ChildrenRuleType)

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

trait Rule {
  val finder: Finder
  val isRawRule = false
  val isPropertyRule = false
  val isChildrenRule = false
}

case class RawRule(finder: Finder, comparator: String, value: String = "") extends Rule {
  override val isRawRule = true
}

case class PropertyRule(finder: Finder, key: String, comparator: String, jsValue: JsValue = JsNull) extends Rule {
  override val isPropertyRule = true
}

object ChildrenRuleType extends ParsableEnum {
  val Any, Exact, SameAnyOrder, SamePlus, SameAnyOrderPlus, Custom = Value
  override val mapping = Map("any"-> Any, "exact"-> Exact, "same-any-order"-> SameAnyOrder, "same-plus"-> SamePlus, "same-any-order-plus"-> SameAnyOrderPlus)
}

case class ChildrenRule(finder: Finder, ruleType: ChildrenRuleType.Value) extends Rule {
  override val isChildrenRule = true
}