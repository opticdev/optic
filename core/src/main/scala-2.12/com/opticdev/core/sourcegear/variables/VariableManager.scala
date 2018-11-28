package com.opticdev.core.sourcegear.variables

import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.sourcegear.gears.parsing.NodeDescription
import com.opticdev.parsers.{IdentifierNodeDesc, ParserBase}
import com.opticdev.common.graph.{AstType, CommonAstNode}
import com.opticdev.common.graph.path.PropertyPathWalker
import com.opticdev.sdk.rules.Rule
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.{PropertyRule, VariableRule}
import com.opticdev.sdk.skills_sdk.OMRange
import com.opticdev.sdk.skills_sdk.compilerInputs.variables.OMVariable
import com.opticdev.sdk.skills_sdk.lens.OMLensNodeFinder
import play.api.libs.json.{JsObject, JsString}

import scala.collection.immutable
import scala.util.Try

case class VariableManager(variables: Vector[OMVariable], identifierNodeDesc: IdentifierNodeDesc) {

  def rules(snippetStageOutput: SnippetStageOutput): Vector[Rule] = {
    val variableAstType = identifierNodeDesc.nodeType

    val flatNodes : Vector[CommonAstNode] =
      snippetStageOutput.astGraph.nodes.toVector
        .filter(_.value.isASTType(variableAstType))
        .map(_.value)
        .asInstanceOf[Vector[CommonAstNode]]

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
      val initialPropertyRule: Rule = PropertyRule(OMLensNodeFinder(first.nodeType.name, OMRange(first.range)), identifierNodeDesc.path.head, "ANY")
      val initialVariableRule: Rule =  VariableRule(OMLensNodeFinder(first.nodeType.name, OMRange(first.range)), variable._1.token)

      //ADD MATCHING RULES TO VARIABLE DEFINITION
      val instanceRules: Seq[VariableRule] = variable._2.filterNot(_ == first).map(instance=> {
        VariableRule(OMLensNodeFinder(instance.nodeType.name, OMRange(instance.range)), variable._1.token)
      })

      Vector(initialPropertyRule, initialVariableRule) ++ instanceRules

    }).toVector

  }

  def variableLookupTable: VariableLookupTable = VariableLookupTable(variables, identifierNodeDesc.path.head, identifierNodeDesc.nodeType)


  def changesFromMapping(variableMapping: VariableMapping): VariableChanges = {
    val changes = variables.map(i=> (i, variableMapping.get(i.token))).collect {
      case (variable, Some(string)) => SetVariable(variable, string)
    }

    VariableChanges(identifierNodeDesc, changes)
  }

}

object VariableManager {
  def empty = new VariableManager(Vector.empty[OMVariable], IdentifierNodeDesc(null, Seq(""))) {
    override def variableLookupTable = VariableLookupTable(variables, "", AstType("", ""))
  }
}