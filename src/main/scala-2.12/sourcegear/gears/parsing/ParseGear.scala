package sourcegear.gears.parsing

import cognitro.parsers.GraphUtils.Path.FlatWalkablePath
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode, Child}
import play.api.libs.json.{JsObject, JsValue}
import sdk.PropertyValue
import sdk.descriptions._
import sdk.descriptions.enums.ComponentEnums
import sourcegear.accumulate.Listener
import sourcegear.gears.RuleProvider
import sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import sourcegear.graph.ModelNode

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

sealed abstract class ParseGear()(implicit val ruleProvider: RuleProvider) {

  val description : NodeDesc
  val components: Map[FlatWalkablePath, Vector[Component]]
  val rules: Map[FlatWalkablePath, Vector[Rule]]
  val listeners : Vector[Listener]

  def matches(entryNode: AstPrimitiveNode, extract: Boolean = false)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) : Option[ParseResult] = {

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

        import sourcegear.gears.helpers.RuleEvaluation.RawRuleWithEvaluation

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
          import sourcegear.gears.helpers.ComponentExtraction._
          componentsAtPath.map(i=> {
            i.extract(node)
          })
        } else Set()


        import sourcegear.gears.helpers.RuleEvaluation.ChildrenRuleWithEvaluation

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

  def output(matchResults: MatchResults) : Option[ParseResult] = None


}

case class ParseAsModel(description: NodeDesc,
                        schema: SchemaId,
                        components: Map[FlatWalkablePath, Vector[Component]],
                        rules: Map[FlatWalkablePath, Vector[Rule]],
                        listeners : Vector[Listener]
                       )(implicit ruleProvider: RuleProvider) extends ParseGear {

  override def output(matchResults: MatchResults) : Option[ParseResult] = {
    if (!matchResults.isMatch) return None

    val model = FlattenModelFields.flattenFields(matchResults.extracted.getOrElse(Set()))

    //@todo have schema validate

    val modelNode = ModelNode(schema, model)

    Option(ParseResult(this, modelNode, matchResults.baseNode.get))

  }

}


//Signaling
case class MatchResults(isMatch: Boolean, extracted: Option[Set[ModelField]], baseNode: Option[AstPrimitiveNode] = None)

//Serializable for Storage
case class RulesDesc()
case class NodeDesc(astType: AstType,
                    edge: Child = Child(0, null),
                    properties: Map[String, PropertyValue],
                    children: Vector[NodeDesc],
                    rules: Vector[RulesDesc]) {

  def propertiesMatch(node: AstPrimitiveNode, propertyRules: Vector[PropertyRule])(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String)  : Boolean = {
    import sdk.PropertyValuesConversions._
    val jsValue = node.properties
    if (!jsValue.isInstanceOf[JsObject]) return false
    val asMap = jsValue.as[JsObject].toScala
    if (asMap.value.nonEmpty) {
      import sourcegear.gears.helpers.RuleEvaluation.PropertyRuleWithEvaluation

      val overridenKeys = propertyRules.map(_.key)

      val filteredMap        = asMap.value.filterKeys(!overridenKeys.contains(_))
      val filteredProperties = properties.filterKeys(!overridenKeys.contains(_))

      filteredProperties == filteredMap && propertyRules.forall(_.evaluate(node) == true)
    } else {
      properties == asMap.value
    }
  }
}

