package com.opticdev.core.sourcegear.gears.helpers


import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, Child}
import com.opticdev.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.JsObject
import com.opticdev.core.sdk.descriptions.{ChildrenRule, PropertyRule, RawRule}
import com.opticdev.core.sourcegear.gears.parsing.{MatchResults, NodeDesc}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object RuleEvaluation {

  implicit class RawRuleWithEvaluation(rawRule: RawRule)  {
    def evaluate(node: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String): Boolean = {
      val raw = fileContents.substring(node.range.start, node.range.end)
      rawRule.comparator match {
        case "==" => raw == rawRule.value
        case "!=" => raw != rawRule.value
        case "ANY" => true
        case _ => false
      }
    }
  }

  implicit class PropertyRuleWithEvaluation(propertyRule: PropertyRule)  {
    def evaluate(node: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String): Boolean = {
      val valueOption = node.properties.as[JsObject] \ propertyRule.key
      if (valueOption.isEmpty) return false
      propertyRule.comparator match {
        case "==" => propertyRule.value.equalsJson(valueOption.get)
        case "!=" => !propertyRule.value.equalsJson(valueOption.get)
        case "ANY" => true
        case _ => false
      }
    }
  }

  implicit class ChildrenRuleWithEvaluation(childrenRule: ChildrenRule)(implicit graph: AstGraph, fileContents: String) {

    def evaluate(node: AstPrimitiveNode, desc: NodeDesc, currentPath: FlatWalkablePath, compareWith: (AstPrimitiveNode, String, NodeDesc, FlatWalkablePath) => MatchResults): MatchResults = {

      val childrenVecor: Vector[(AstPrimitiveNode, String)] = node.children.map(c=> (c._2, c._1.asInstanceOf[Child].typ))


      def equality(astNodeWithType: (AstPrimitiveNode, String), nodeDesc: NodeDesc): MatchResults = {
        compareWith(astNodeWithType._1, astNodeWithType._2, nodeDesc, currentPath.append(nodeDesc.edge))
      }

      import com.opticdev.core.sdk.descriptions.enums.RuleEnums._
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
