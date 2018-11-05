package com.opticdev.core.sourcegear.gears.parsing

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.{PropertyValue, VariableMapping}
import com.opticdev.sdk.descriptions._
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.core.sourcegear.accumulate.Listener
import com.opticdev.core.sourcegear.annotations.{AnnotationParser, NameAnnotation, SourceAnnotation, TagAnnotation}
import com.opticdev.core.sourcegear.containers.SubContainerMatch
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.gears.helpers.{FlattenModelFields, ModelField}
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.parsers.{AstGraph, ParserBase}
import com.opticdev.parsers.graph.{AstType, Child, CommonAstNode}
import com.opticdev.parsers.graph.path.FlatWalkablePath
import play.api.libs.json.{JsObject, JsValue}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.RawRuleWithEvaluation
import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.VariableRuleWithEvaluation
import com.opticdev.core.sourcegear.variables.VariableManager

import scala.util.hashing.MurmurHash3
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers.rules.{AllChildrenRule, ParserChildrenRule, Rule}
import com.opticdev.sdk.skills_sdk.LensRef
import com.opticdev.sdk.skills_sdk.compilerInputs.subcontainers.OMSubContainer
import com.opticdev.sdk.skills_sdk.lens.{OMComponentWithPropertyPath, OMLensCodeComponent, OMLensComponent}
import com.opticdev.sdk.skills_sdk.schema.OMSchema

sealed abstract class ParseGear() {

  val description : NodeDescription
  val components: Map[FlatWalkablePath, Vector[OMComponentWithPropertyPath[OMLensCodeComponent]]]
  val containers: Map[FlatWalkablePath, OMSubContainer]
  val rules: Map[FlatWalkablePath, Vector[RuleWithFinder]]
  val listeners : Vector[Listener]

  val packageId: String
  val parsingLensRef: LensRef
  val priority: Int
  val additionalParserInformation : AdditionalParserInformation
  val variableManager : VariableManager
  val internal: Boolean

  def hash = {
        MurmurHash3.stringHash(description.toString) ^
        MurmurHash3.mapHash(components) ^
        MurmurHash3.mapHash(containers) ^
        MurmurHash3.mapHash(rules) ^
        MurmurHash3.listHash(listeners.toList, 3221945) ^
        MurmurHash3.listHash(variableManager.variables.toList, 2317453)
  }

  def matches(entryNode: CommonAstNode, extract: Boolean = false)(implicit astGraph: AstGraph, fileContents: String, sourceGearContext: SGContext, project: ProjectBase) : Option[ParseResult[CommonAstNode]] = {

    implicit val parser = sourceGearContext.parser
    val extractableComponents = components.mapValues(_.filter(_.component.isInstanceOf[OMLensCodeComponent]))

    //new for each search instance
    val variableLookupTable = variableManager.variableLookupTable

    def compareWith(n:CommonAstNode, edgeType: String, d:NodeDescription, path: FlatWalkablePath) = {
      compareToDescription(n, edgeType, d, path)
    }

    def compareToDescription(node: CommonAstNode, childType: String, desc: NodeDescription, currentPath: FlatWalkablePath) : MatchResults = {
      val componentsAtPath = extractableComponents.getOrElse(currentPath, Vector[OMComponentWithPropertyPath[OMLensCodeComponent]]())
      val expectedSubContainerAtPath = containers.get(currentPath)
      val rulesAtPath      = RuleProvider.applyDefaultRulesForType(rules.getOrElse(currentPath, Vector[Rule]()), node.nodeType)

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


        import com.opticdev.core.sourcegear.gears.helpers.RuleEvaluation.ParserChildrenRuleVectorWithEvaluation

        val childrenRules = {
          val ruleVector = rulesAtPath.collect{ case i: ParserChildrenRule => i}
          if (ruleVector.isEmpty) Vector(RuleProvider.globalChildrenDefaultRule) else ruleVector
        }
        //returns final results & extractions
        val childrenResults = childrenRules.evaluate(node, desc, currentPath, compareWith)

        val foundContainer: Set[SubContainerMatch] = expectedSubContainerAtPath.map(c=> Set(SubContainerMatch(c, node))).getOrElse(Set())

        MatchResults(childrenResults.isMatch,
          if (childrenResults.isMatch) Some(childrenResults.extracted.getOrElse(Set()) ++ extractedFields) else None,
          if (childrenResults.isMatch) Some(entryNode) else None,
          if (childrenResults.isMatch) Some(childrenResults.containers.getOrElse(Set()) ++ foundContainer) else None
        )

      } else MatchResults(false, None)

    }

    val matchResults = compareToDescription(entryNode, null, description, FlatWalkablePath())

    output(matchResults, variableLookupTable.toVariableMapping)
  }

  def output(matchResults: MatchResults, variableMapping: VariableMapping)(implicit sourceGearContext: SGContext, project: ProjectBase, fileContents: String) : Option[ParseResult[CommonAstNode]] = None


}


case class ParseAsModel(description: NodeDescription,
                        schema: SchemaRef,
                        components: Map[FlatWalkablePath, Vector[OMComponentWithPropertyPath[OMLensCodeComponent]]],
                        containers: Map[FlatWalkablePath, OMSubContainer],
                        rules: Map[FlatWalkablePath, Vector[RuleWithFinder]],
                        listeners : Vector[Listener],
                        variableManager: VariableManager = VariableManager.empty,
                        additionalParserInformation : AdditionalParserInformation,
                        packageId: String,
                        parsingLensRef: LensRef,
                        priority: Int,
                        initialValue: JsObject = JsObject.empty,
                        internal: Boolean = false,
                       ) extends ParseGear {

  override def output(matchResults: MatchResults, variableMapping: VariableMapping) (implicit sourceGearContext: SGContext, project: ProjectBase, fileContents: String) : Option[ParseResult[CommonAstNode]] = {
    if (!matchResults.isMatch) return None

    val fields = matchResults.extracted.getOrElse(Set())

    val model = FlattenModelFields.flattenFields(fields, initialValue)
    import com.opticdev.core.sourcegear.graph.model.MappingImplicits._
    val modelMapping = fields.toMapping

    import com.opticdev.core.sourcegear.containers.ContainerMappingImplicits._
    val containerMapping = matchResults.containers.getOrElse(Set()).toMapping

    val (objectRefOption, sourceAnnotationOption, tagAnnotation) = {
      val raw = AnnotationParser.contentsToCheck(matchResults.baseNode.get)
      val annotations = AnnotationParser.extract(raw, schema)(sourceGearContext.parser)
      ( annotations.collectFirst { case na: NameAnnotation => na }.map(_.objectRef),
        annotations.collectFirst { case sa: SourceAnnotation => sa },
        annotations.collectFirst { case ta: TagAnnotation => ta },
      )
    }

    val linkedModelNode = LinkedModelNode(
      schema,
      model,
      parsingLensRef,
      priority,
      matchResults.baseNode.get,
      modelMapping,
      containerMapping,
      this,
      variableMapping,
      objectRefOption,
      sourceAnnotationOption,
      tagAnnotation,
      internal)

    //@todo have schema validate
    Option(ParseResult(this, linkedModelNode, matchResults.baseNode.get))

  }
}