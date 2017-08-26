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

      val childrenVecor: Vector[(AstPrimitiveNode, String)] = node.getChildren.map(c=> (c._2, c._1.asInstanceOf[Child].typ))


      def equality(astNodeWithType: (AstPrimitiveNode, String), nodeDesc: NodeDesc): MatchResults = {
        compareWith(astNodeWithType._1, astNodeWithType._2, nodeDesc, currentPath.append(nodeDesc.edge))
      }

      import sdk.descriptions.ChildrenRuleType._
      childrenRule.ruleType match {
        case Any => ChildrenVectorComparison.any
          [(AstPrimitiveNode, String), NodeDesc](childrenVecor, desc.children, equality)
        case Exact => ChildrenVectorComparison.exact
          [(AstPrimitiveNode, String), NodeDesc](childrenVecor, desc.children, equality)
        case SamePlus => ChildrenVectorComparison.samePlus
          [(AstPrimitiveNode, String), NodeDesc](childrenVecor, desc.children, equality)
        case SameAnyOrder => ChildrenVectorComparison.sameAnyOrder
          [(AstPrimitiveNode, String), NodeDesc](childrenVecor, desc.children, equality)
        case SameAnyOrderPlus => ChildrenVectorComparison.sameAnyOrderPlus
          [(AstPrimitiveNode, String), NodeDesc](childrenVecor, desc.children, equality)

        case _ => MatchResults(false, None)
      }

    }

  }


}
