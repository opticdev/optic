package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.core.sdk.PropertyValue
import com.opticdev.core.sdk.descriptions._
import com.opticdev.core.sourcegear.SourceGearContext
import com.opticdev.core.sourcegear.accumulate.Listener
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, AstType, Child}
import com.opticdev.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.{JsObject, JsValue}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

sealed abstract class ParseGear()(implicit val ruleProvider: RuleProvider) {

  val description : NodeDesc
  val components: Map[FlatWalkablePath, Vector[Component]]
  val rules: Map[FlatWalkablePath, Vector[Rule]]
  val listeners : Vector[Listener]

  def matches(entryNode: AstPrimitiveNode, extract: Boolean = false)(implicit astGraph: AstGraph, fileContents: String, sourceGearContext: SourceGearContext) : Option[ParseResult] = {

    val extractableComponents = components.mapValues(_.filter(_.isInstanceOf[CodeComponent]))

    def compareWith(n:AstPrimitiveNode, edgeType: String, d:NodeDesc, path: FlatWalkablePath) = {
      compareToDescription(n, edgeType, d, path)
    }

    def compareToDescription(node: AstPrimitiveNode, childType: String, desc: NodeDesc, currentPath: FlatWalkablePath) : MatchResults = {
      val componentsAtPath = extractableComponents.getOrElse(currentPath, Vector[Component]())
      val rulesAtPath      = ruleProvider.applyDefaultRulesForType(rules.getOrElse(currentPath, Vector[Rule]()), node.nodeType)

      val isMatch = {
        val nodeTypesMatch = node.nodeType == desc.astType
        val childTypesMatch = childType == desc.edge.typ

        val propertyRules = rulesAtPath.filter(_.isPropertyRule).asInstanceOf[Vector[PropertyRule]]
        val propertiesMatch = desc.propertiesMatch(node, propertyRules)

        val rawRules = rulesAtPath.filter(_.isRawRule).asInstanceOf[Vector[RawRule]]

        import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.RawRuleWithEvaluation

        val rawRulesEvaluated = rawRules.forall(_.evaluate(node))

        val compareSet = {
          val base = Seq(nodeTypesMatch, childTypesMatch)
          if (rawRules.nonEmpty) {
            base :+ rawRulesEvaluated
          } else {
            base :+ propertiesMatch
          }
        }

        compareSet.forall(_ == true)
      }

      //proceed only if raw parts match (avoids costly/unneeded recursion)
      if (isMatch) {

        //extract any values we need to
        val extractedFields = if (extract) {
          import com.opticdev.core.sourcegear.gears.helpers.ComponentExtraction._
          componentsAtPath.map(i=> {
            i.extract(node)
          })
        } else Set()


        import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.ChildrenRuleWithEvaluation

        val childrenRule = rulesAtPath.find(_.isChildrenRule).getOrElse(ruleProvider.globalChildrenDefaultRule).asInstanceOf[ChildrenRule]
        //returns final results & extractions
        val childrenResults = childrenRule.evaluate(node, desc, currentPath, compareWith)

        MatchResults(childrenResults.isMatch,
          if (childrenResults.isMatch) Option(childrenResults.extracted.getOrElse(Set()) ++ extractedFields) else None,
          if (childrenResults.isMatch) Option(entryNode) else None)

      } else MatchResults(false, None)

    }

    val matchResults = compareToDescription(entryNode, null, description, FlatWalkablePath())

    output(matchResults)
  }

  def output(matchResults: MatchResults)(implicit sourceGearContext: SourceGearContext) : Option[ParseResult] = None


}

case class ParseAsModel(description: NodeDesc,
                        schema: SchemaId,
                        components: Map[FlatWalkablePath, Vector[Component]],
                        rules: Map[FlatWalkablePath, Vector[Rule]],
                        listeners : Vector[Listener]
                       )(implicit ruleProvider: RuleProvider) extends ParseGear {

  override def output(matchResults: MatchResults) (implicit sourceGearContext: SourceGearContext) : Option[ParseResult] = {
    if (!matchResults.isMatch) return None

    val fields = matchResults.extracted.getOrElse(Set())

    val model = FlattenModelFields.flattenFields(fields)
    import com.opticdev.core.sourcegear.graph.model.MappingImplicits._
    val mapping = fields.toMapping

    val linkedModelNode = LinkedModelNode(schema, model, mapping)

    //@todo have schema validate
    Option(ParseResult(this, linkedModelNode, matchResults.baseNode.get))

  }

}
