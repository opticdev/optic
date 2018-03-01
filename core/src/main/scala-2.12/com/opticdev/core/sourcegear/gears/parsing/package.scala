package com.opticdev.core.sourcegear.gears

import com.opticdev.core.sourcegear.containers.{SubContainerManager, SubContainerMatch}
import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{CommonAstNode, AstType, Child}
import com.opticdev.sdk.PropertyValue
import com.opticdev.sdk.descriptions.PropertyRule
import play.api.libs.json.JsObject

package object parsing {

  sealed case class Hello(string: String)

  //Signaling
  case class MatchResults(isMatch: Boolean,
                          extracted: Option[Set[ModelField]] = None,
                          baseNode: Option[CommonAstNode] = None,
                          containers: Option[Set[SubContainerMatch]] = None
                         )

  //Serializable for Storage
  case class RulesDesc()

  case class NodeDescription(astType: AstType,
                             range: Range,
                             edge: Child = Child(0, null),
                             properties: Map[String, PropertyValue],
                             children: Vector[NodeDescription],
                             rules: Vector[RulesDesc]) {

    def propertiesMatch(node: CommonAstNode, propertyRules: Vector[PropertyRule])(implicit graph: AstGraph, fileContents: String)  : Boolean = {
      import com.opticdev.sdk.PropertyValuesConversions._
      val jsValue = node.properties
      if (!jsValue.isInstanceOf[JsObject]) return false
      val asMap = jsValue.as[JsObject].toScala
      if (asMap.value.nonEmpty) {
        import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.PropertyRuleWithEvaluation

        val overridenKeys = propertyRules.map(_.key)

        val filteredMap        = asMap.value.filterKeys(!overridenKeys.contains(_))
        val filteredProperties = properties.filterKeys(!overridenKeys.contains(_))

        filteredProperties == filteredMap && propertyRules.forall(_.evaluate(node) == true)
      } else {
        properties == asMap.value
      }
    }

    def matchingPredicate = (CommonAstNode: CommonAstNode) => CommonAstNode.nodeType == astType && CommonAstNode.range == range
    def matchingLoosePredicate = (CommonAstNode: CommonAstNode) => CommonAstNode.nodeType == astType && CommonAstNode.range.start == range.start

    def flatNodes: Seq[NodeDescription] = {
      children.flatMap(_.flatNodes) :+ this
    }

  }



}
