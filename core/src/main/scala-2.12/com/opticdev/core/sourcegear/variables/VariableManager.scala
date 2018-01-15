package com.opticdev.core.sourcegear.variables

import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.sourcegear.gears.parsing.NodeDescription
import com.opticdev.parsers.{IdentifierNodeDesc, ParserBase}
import com.opticdev.parsers.graph.AstPrimitiveNode
import com.opticdev.parsers.graph.path.PropertyPathWalker
import com.opticdev.sdk.descriptions.finders.NodeFinder
import com.opticdev.sdk.descriptions.{PropertyRule, Rule, Variable, VariableRule}
import play.api.libs.json.{JsObject, JsString}

import scala.collection.immutable
import scala.util.Try

case class VariableManager(variables: Vector[Variable], identifierNodeDesc: IdentifierNodeDesc) {

  def rules(snippetStageOutput: SnippetStageOutput): Vector[Rule] = {
    val variableAstType = identifierNodeDesc.nodeType

    val flatNodes : Vector[AstPrimitiveNode] =
      snippetStageOutput.astGraph.nodes.toVector
        .filter(_.value.isASTType(variableAstType))
        .map(_.value)
        .asInstanceOf[Vector[AstPrimitiveNode]]

    val variablesInSnippet = flatNodes.filter(i=> {
      i.nodeType == variableAstType && {
        val token = i.properties.as[JsObject].value(identifierNodeDesc.path.head)
        variables.exists(variable=> token == JsString(variable.token))
      }
    }).groupBy(i=> variables.find(v=> i.properties(identifierNodeDesc.path.head) == JsString(v.token)).get)
      .filterNot(_._2.isEmpty)


    variablesInSnippet.flatMap(variable=> {

      val first = variable._2.minBy(_.range.start)

      //add a property rule for ANY
      val initialPropertyRule: Rule = PropertyRule(NodeFinder(first.nodeType, first.range), identifierNodeDesc.path.head, "ANY")
      val initialVariableRule: Rule =  VariableRule(NodeFinder(first.nodeType, first.range), variable._1.token)

      //ADD MATCHING RULES TO VARIABLE DEFINITION
      val instanceRules: Seq[VariableRule] = variable._2.filterNot(_ == first).map(instance=> {
        VariableRule(NodeFinder(instance.nodeType, instance.range), variable._1.token)
      })

      Vector(initialPropertyRule, initialVariableRule) ++ instanceRules

    }).toVector

  }

  def variableLookupTable: VariableLookupTable = VariableLookupTable(variables, identifierNodeDesc.path.head)

}

object VariableManager {
  def empty = new VariableManager(Vector.empty[Variable], null) {
    override def variableLookupTable = VariableLookupTable(variables, null)
  }
}