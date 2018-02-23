package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{CommonAstNode, Child}
import com.opticdev.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.JsObject
import com.opticdev.sdk.descriptions.{ChildrenRule, PropertyRule, RawRule, VariableRule}
import com.opticdev.core.sourcegear.gears.parsing.{MatchResults, NodeDescription}
import com.opticdev.core.sourcegear.variables.VariableLookupTable

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object RuleEvaluation {

  implicit class RawRuleWithEvaluation(rawRule: RawRule)  {
    def evaluate(node: CommonAstNode)(implicit graph: AstGraph, fileContents: String): Boolean = {
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
    def evaluate(node: CommonAstNode)(implicit graph: AstGraph, fileContents: String): Boolean = {
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

  implicit class VariableRuleWithEvaluation(variableRule: VariableRule)  {
    def evaluate(node: CommonAstNode, variableLookupTable: VariableLookupTable)(implicit graph: AstGraph, fileContents: String): Boolean = {
      variableLookupTable.astNodeMatchesVariable(variableRule, node)
    }
  }


  implicit class ChildrenRuleWithEvaluation(childrenRule: ChildrenRule)(implicit graph: AstGraph, fileContents: String) {

    def evaluate(node: CommonAstNode, desc: NodeDescription, currentPath: FlatWalkablePath, compareWith: (CommonAstNode, String, NodeDescription, FlatWalkablePath) => MatchResults): MatchResults = {

      val childrenVecor: Vector[(CommonAstNode, String)] = node.children.map(c=> (c._2, c._1.asInstanceOf[Child].typ))


      def equality(astNodeWithType: (CommonAstNode, String), nodeDesc: NodeDescription): MatchResults = {
        compareWith(astNodeWithType._1, astNodeWithType._2, nodeDesc, currentPath.append(nodeDesc.edge))
      }

      import com.opticdev.sdk.descriptions.enums.RuleEnums._
      childrenRule.ruleType match {
        case Any => ChildrenVectorComparison.any
          [(CommonAstNode, String), NodeDescription](childrenVecor, desc.children, equality)
        case Exact => ChildrenVectorComparison.exact
          [(CommonAstNode, String), NodeDescription](childrenVecor, desc.children, equality)
        case SamePlus => ChildrenVectorComparison.samePlus
          [(CommonAstNode, String), NodeDescription](childrenVecor, desc.children, equality)
        case SameAnyOrder => ChildrenVectorComparison.sameAnyOrder
          [(CommonAstNode, String), NodeDescription](childrenVecor, desc.children, equality)
        case SameAnyOrderPlus => ChildrenVectorComparison.sameAnyOrderPlus
          [(CommonAstNode, String), NodeDescription](childrenVecor, desc.children, equality)

        case _ => MatchResults(false, None)
      }

    }

  }


}
