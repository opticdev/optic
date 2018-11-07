package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.common.graph.{AstGraph, Child, CommonAstNode}
import com.opticdev.common.graph.path.FlatWalkablePath
import play.api.libs.json.JsObject
import com.opticdev.sdk.descriptions.{ChildrenRule, PropertyRule, RawRule, VariableRule}
import com.opticdev.core.sourcegear.gears.parsing.{MatchResults, NodeDescription}
import com.opticdev.core.sourcegear.variables.VariableLookupTable
import com.opticdev.sdk.rules._
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

  implicit class ParserChildrenRuleVectorWithEvaluation(rules: Vector[ParserChildrenRule])(implicit graph: AstGraph, fileContents: String) {

    def evaluate(node: CommonAstNode, desc: NodeDescription, currentPath: FlatWalkablePath, compareWith: (CommonAstNode, String, NodeDescription, FlatWalkablePath) => MatchResults): MatchResults = {

      val specificRules = rules.collect{case r: SpecificChildrenRule => r}
      val allChildrenRule = rules.collectFirst{case r: AllChildrenRule => r}.getOrElse(RuleProvider.globalChildrenDefaultRule)

      val childrenVector: Vector[(CommonAstNode, String)] = node.children.map(c=> (c._2, c._1.asInstanceOf[Child].typ))

      val matchResults = scala.collection.mutable.ListBuffer[MatchResults]()

      val specificRulesEvaluated = specificRules.foldLeft(true) {
        case (b, rule) => if (!b) false else {
          val results = rule.evaluate(node, childrenVector.filter(_._2 == rule.edgeType), desc.filterChildren(_.edge.typ == rule.edgeType), currentPath, compareWith)
          matchResults += results
          results.isMatch
        }
      }

      val handledEdgeTypes = specificRules.map(_.edgeType)
      val allChildrenRuleEvaluation = allChildrenRule.evaluate(node, childrenVector.filterNot(child=> handledEdgeTypes.contains(child._2)), desc.filterChildren(child=> !handledEdgeTypes.contains(child.edge.typ)), currentPath, compareWith)

      if (specificRulesEvaluated && allChildrenRuleEvaluation.isMatch) {
        val combinedMatchResults = matchResults.toVector :+ allChildrenRuleEvaluation
        combinedMatchResults.foldLeft(combinedMatchResults.head)(_.mergeWith(_))
      } else {
        MatchResults(false, None)
      }

    }

  }

  implicit class ParserChildrenRuleWithEvaluation(parserChildrenRule: ParserChildrenRule)(implicit graph: AstGraph, fileContents: String) {

    def evaluate(node: CommonAstNode, childrenVector: Vector[(CommonAstNode, String)], desc: NodeDescription, currentPath: FlatWalkablePath, compareWith: (CommonAstNode, String, NodeDescription, FlatWalkablePath) => MatchResults): MatchResults = {


      def equality(astNodeWithType: (CommonAstNode, String), nodeDesc: NodeDescription): MatchResults = {
        compareWith(astNodeWithType._1, astNodeWithType._2, nodeDesc, currentPath.append(nodeDesc.edge))
      }

      import com.opticdev.sdk.descriptions.enums.RuleEnums._
      parserChildrenRule.rule match {
        case Any => ChildrenVectorComparison.any
          [(CommonAstNode, String), NodeDescription](childrenVector, desc.children, equality)
        case Exact => ChildrenVectorComparison.exact
          [(CommonAstNode, String), NodeDescription](childrenVector, desc.children, equality)
        case SamePlus => ChildrenVectorComparison.samePlus
          [(CommonAstNode, String), NodeDescription](childrenVector, desc.children, equality)
        case SameAnyOrder => ChildrenVectorComparison.sameAnyOrder
          [(CommonAstNode, String), NodeDescription](childrenVector, desc.children, equality)
        case SameAnyOrderPlus => ChildrenVectorComparison.sameAnyOrderPlus
          [(CommonAstNode, String), NodeDescription](childrenVector, desc.children, equality)

        case _ => MatchResults(false, None)
      }

    }

  }


}
