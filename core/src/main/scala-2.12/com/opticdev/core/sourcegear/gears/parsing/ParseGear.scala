package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.sdk.PropertyValue
import com.opticdev.sdk.descriptions._
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.accumulate.Listener
import com.opticdev.core.sourcegear.containers.SubContainerMatch
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.{CommonAstNode, AstType, Child}
import com.opticdev.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.{JsObject, JsValue}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.RawRuleWithEvaluation
import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.VariableRuleWithEvaluation
import com.opticdev.core.sourcegear.variables.VariableManager

import scala.util.hashing.MurmurHash3

sealed abstract class ParseGear()(implicit val ruleProvider: RuleProvider) {

  val description : NodeDescription
  val components: Map[FlatWalkablePath, Vector[Component]]
  val containers: Map[FlatWalkablePath, SubContainer]
  val rules: Map[FlatWalkablePath, Vector[Rule]]
  val listeners : Vector[Listener]

  val additionalParserInformation : AdditionalParserInformation

  val variableManager : VariableManager

  def hash = {
        MurmurHash3.stringHash(description.toString) ^
        MurmurHash3.mapHash(components) ^
        MurmurHash3.mapHash(containers) ^
        MurmurHash3.mapHash(rules) ^
        MurmurHash3.listHash(listeners.toList, 3221945) ^
        MurmurHash3.listHash(variableManager.variables.toList, 2317453)
  }

  def matches(entryNode: CommonAstNode, extract: Boolean = false)(implicit astGraph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: OpticProject) : Option[ParseResult] = {

    val extractableComponents = components.mapValues(_.filter(_.isInstanceOf[CodeComponent]))

    //new for each search instance
    val variableLookupTable = variableManager.variableLookupTable

    def compareWith(n:CommonAstNode, edgeType: String, d:NodeDescription, path: FlatWalkablePath) = {
      compareToDescription(n, edgeType, d, path)
    }

    def compareToDescription(node: CommonAstNode, childType: String, desc: NodeDescription, currentPath: FlatWalkablePath) : MatchResults = {
      val componentsAtPath = extractableComponents.getOrElse(currentPath, Vector[Component]())
      val expectedSubContainerAtPath = containers.get(currentPath)
      val rulesAtPath      = ruleProvider.applyDefaultRulesForType(rules.getOrElse(currentPath, Vector[Rule]()), node.nodeType)

      val isMatch = {
        val nodeTypesMatch = node.nodeType == desc.astType
        val childTypesMatch = childType == desc.edge.typ

        val propertyRules = rulesAtPath.filter(_.isPropertyRule).asInstanceOf[Vector[PropertyRule]]
        val propertiesMatch = desc.propertiesMatch(node, propertyRules)

        val rawRules = rulesAtPath.filter(_.isRawRule).asInstanceOf[Vector[RawRule]]

        val rawRulesEvaluated = rawRules.forall(_.evaluate(node))

        val variableRules = rulesAtPath.filter(_.isVariableRule).asInstanceOf[Vector[VariableRule]]

        val variableRulesEvaluated = variableRules.forall(_.evaluate(node, variableLookupTable))

        val compareSet = {
          val base = Seq(nodeTypesMatch, childTypesMatch)
          //property rules are only applied if not handled by one of these cases
          if (rawRules.nonEmpty) {
            base :+ rawRulesEvaluated
          } else if (variableRules.nonEmpty) {
            base :+ variableRulesEvaluated
          } else if (expectedSubContainerAtPath.isDefined) {
            base :+ additionalParserInformation.blockNodeTypes.contains(node.nodeType)
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

        val foundContainer: Set[SubContainerMatch] = expectedSubContainerAtPath.map(c=> Set(SubContainerMatch(c, node))).getOrElse(Set())

//        println("LOOK HERE "+ childrenResults.containers)
//        println(foundContainer)

        MatchResults(childrenResults.isMatch,
          if (childrenResults.isMatch) Some(childrenResults.extracted.getOrElse(Set()) ++ extractedFields) else None,
          if (childrenResults.isMatch) Some(entryNode) else None,
          if (childrenResults.isMatch) Some(childrenResults.containers.getOrElse(Set()) ++ foundContainer) else None
        )

      } else MatchResults(false, None)

    }

    val matchResults = compareToDescription(entryNode, null, description, FlatWalkablePath())

    output(matchResults)
  }

  def output(matchResults: MatchResults)(implicit sourceGearContext: SGContext, project: OpticProject) : Option[ParseResult] = None


}


case class ParseAsModel(description: NodeDescription,
                        schema: SchemaRef,
                        components: Map[FlatWalkablePath, Vector[Component]],
                        containers: Map[FlatWalkablePath, SubContainer],
                        rules: Map[FlatWalkablePath, Vector[Rule]],
                        listeners : Vector[Listener],
                        variableManager: VariableManager = VariableManager.empty,
                        additionalParserInformation : AdditionalParserInformation
                       )(implicit ruleProvider: RuleProvider) extends ParseGear {

  override def output(matchResults: MatchResults) (implicit sourceGearContext: SGContext, project: OpticProject) : Option[ParseResult] = {
    if (!matchResults.isMatch) return None

    val fields = matchResults.extracted.getOrElse(Set())

    val model = FlattenModelFields.flattenFields(fields)
    import com.opticdev.core.sourcegear.graph.model.MappingImplicits._
    val modelMapping = fields.toMapping

    import com.opticdev.core.sourcegear.containers.ContainerMappingImplicits._
    val containerMapping = matchResults.containers.getOrElse(Set()).toMapping

    val linkedModelNode = LinkedModelNode(schema, model, matchResults.baseNode.get, modelMapping, containerMapping, this)

    //@todo have schema validate
    Option(ParseResult(this, linkedModelNode, matchResults.baseNode.get))

  }
}


case class ParseAsContainer(description: NodeDescription,
                        containers: Map[FlatWalkablePath, SubContainer],
                        rules: Map[FlatWalkablePath, Vector[Rule]],
                        variableManager: VariableManager = VariableManager.empty,
                        additionalParserInformation : AdditionalParserInformation
                       )(implicit ruleProvider: RuleProvider) extends ParseGear {

  override def output(matchResults: MatchResults)(implicit sourceGearContext: SGContext, project: OpticProject): Option[ParseResult] = {

    None
  }

  //not set for containers
  override val components = Map()
  override val listeners = Vector()
}