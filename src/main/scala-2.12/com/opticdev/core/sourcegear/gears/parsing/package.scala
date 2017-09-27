package com.opticdev.core.sourcegear.gears

import com.opticdev.core.sdk.PropertyValue
import com.opticdev.core.sdk.descriptions.PropertyRule
import com.opticdev.core.sourcegear.gears.helpers.ModelField
import com.opticdev.parsers._
import com.opticdev.parsers.graph.{AstPrimitiveNode, AstType, Child}
import play.api.libs.json.JsObject

package object parsing {
  //Signaling
  case class MatchResults(isMatch: Boolean, extracted: Option[Set[ModelField]], baseNode: Option[AstPrimitiveNode] = None)

  //Serializable for Storage
  case class RulesDesc()

  case class NodeDesc(astType: AstType,
                      range: Range,
                      edge: Child = Child(0, null),
                      properties: Map[String, PropertyValue],
                      children: Vector[NodeDesc],
                      rules: Vector[RulesDesc]) {

    def propertiesMatch(node: AstPrimitiveNode, propertyRules: Vector[PropertyRule])(implicit graph: AstGraph, fileContents: String)  : Boolean = {
      import com.opticdev.core.sdk.PropertyValuesConversions._
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

    def matchingPredicate = (astPrimitiveNode: AstPrimitiveNode) => astPrimitiveNode.nodeType == astType && astPrimitiveNode.range == range

  }


}
