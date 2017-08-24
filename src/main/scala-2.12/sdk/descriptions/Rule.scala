package sdk.descriptions

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.{JsError, JsSuccess, _}
import sdk.descriptions.Finders.{Finder, NodeFinder, RangeFinder, StringFinder}
import sdk.descriptions.helpers.ParsableEnum

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object Rule extends Description[Rule] {

  implicit val rawRule = Json.reads[RawRuleDesc]
  implicit val propertyRule = Json.reads[PropertyRuleDesc]
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

    val ruleType = (jsValue \ "type")

    if (ruleType.isDefined && ruleType.get.isInstanceOf[JsString]) {

      val result: JsResult[Rule] = ruleType.get.as[JsString].value match {
        case "raw" => Json.fromJson[RawRuleDesc](jsValue)
        case "property" => Json.fromJson[PropertyRuleDesc](jsValue)
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
  def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) : Boolean = false
  val isRawRule = false
  val isPropertyRule = false
  val isChildrenRule = false
}

case class RawRuleDesc(finder: Finder, comparator: String, value: String = "") extends Rule {
  override val isRawRule = true
  override def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String): Boolean = {
    val raw = fileContents.substring(node.range._1, node.range._2)
    comparator match {
      case "==" => raw == value
      case "!=" => raw != value
      case "ANY" => true
      case _ => false
    }
  }

}
case class PropertyRuleDesc(finder: Finder, comparator: String, value: String = "") extends Rule
case class ChildrenRule(finder: Finder) extends Rule