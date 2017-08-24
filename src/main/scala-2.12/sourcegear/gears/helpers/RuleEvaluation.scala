package sourcegear.gears.helpers

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import play.api.libs.json.JsObject
import sdk.descriptions.{PropertyRule, RawRule}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

protected trait CanEvaluate {
  def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) : Boolean
}

object RuleEvaluation {

  implicit class RawRuleWithEvaluation(rawRule: RawRule) extends CanEvaluate {
    override def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String): Boolean = {
      val raw = fileContents.substring(node.range._1, node.range._2)
      rawRule.comparator match {
        case "==" => raw == rawRule.value
        case "!=" => raw != rawRule.value
        case "ANY" => true
        case _ => false
      }
    }
  }

  implicit class PropertyRuleWithEvaluation(propertyRule: PropertyRule) extends CanEvaluate {
    override def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String): Boolean = {
      val valueOption = node.properties.as[JsObject] \ propertyRule.key
      if (valueOption.isEmpty) return false
      propertyRule.comparator match {
        case "==" => valueOption.get == propertyRule.jsValue
        case "!=" => valueOption.get != propertyRule.jsValue
        case "ANY" => true
        case _ => false
      }
    }
  }


}
