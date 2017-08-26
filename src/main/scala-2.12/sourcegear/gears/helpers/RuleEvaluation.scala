package sourcegear.gears.helpers

import cognitro.parsers.GraphUtils.Path.FlatWalkablePath
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode, Child}
import play.api.libs.json.JsObject
import sdk.descriptions.{ChildrenRule, PropertyRule, RawRule}
import sourcegear.gears.{MatchResults, NodeDesc}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object RuleEvaluation {

  implicit class RawRuleWithEvaluation(rawRule: RawRule)  {
    def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String): Boolean = {
      val raw = fileContents.substring(node.range._1, node.range._2)
      rawRule.comparator match {
        case "==" => raw == rawRule.value
        case "!=" => raw != rawRule.value
        case "ANY" => true
        case _ => false
      }
    }
  }

  implicit class PropertyRuleWithEvaluation(propertyRule: PropertyRule)  {
    def evaluate(node: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String): Boolean = {
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

  implicit class ChildrenRuleWithEvaluation(childrenRule: ChildrenRule)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) {

    def evaluate(node: AstPrimitiveNode, desc: NodeDesc, currentPath: FlatWalkablePath, compareWith: (AstPrimitiveNode, String, NodeDesc, FlatWalkablePath) => MatchResults): MatchResults = {
      import sdk.descriptions.ChildrenRuleType._
      childrenRule.ruleType match {
        case Any => MatchResults(true, None)
        case Exact => {
          false
        }
        case SamePlus => false
        case SameAnyOrder => false
        case SameAnyOrderPlus => false
      }

      MatchResults(true, None)
    }


    private def exactComparison(node: AstPrimitiveNode, desc: NodeDesc, currentPath: FlatWalkablePath, compareWith: (AstPrimitiveNode, String, NodeDesc, FlatWalkablePath) => MatchResults): () => MatchResults = () => {
      //same size assumed since its step 2

      val childResults = node.getChildren.zip(desc.children).map {
        case ((edge, node), descChild) => {
          val edgeAsChild = edge.asInstanceOf[Child]
          compareWith(node, edgeAsChild.typ, descChild, currentPath.append(edgeAsChild))
        }
      }

      val isChildMatch = !childResults.exists(_.isMatch == false)

      if (isChildMatch) {
        MatchResults(true, Option(childResults.flatMap(_.extracted.getOrElse(Set())).toSet))
      } else {
        MatchResults(false, None)
      }

    }

    private def containsSameChildren(node: AstPrimitiveNode, desc: NodeDesc, currentPath: FlatWalkablePath, compareWith: (AstPrimitiveNode, String, NodeDesc, FlatWalkablePath) => MatchResults): () => MatchResults = () => {

      val descriptionChildren = collection.mutable.Set(desc.children:_*)

      null
    }

  }


}
