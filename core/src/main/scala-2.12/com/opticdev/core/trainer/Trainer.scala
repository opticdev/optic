package com.opticdev.core.trainer

import com.opticdev.common.utils.JsonUtils
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.{AstGraph, SourceParserManager}
import com.opticdev.parsers.sourcegear.basic.TokenInterfaces
import com.opticdev.sdk.descriptions.{CodeComponent, Lens, Snippet}
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.descriptions.enums.{Literal, Token}
import com.opticdev.sdk.descriptions.finders.NodeFinder
import play.api.libs.json.JsObject

import scala.collection.mutable

class Trainer(filePath: String, languageName: String, exampleSnippet: String, expectedValue: JsObject) {

  implicit val lens = Lens(null, null, null, null, null, null, Vector(), null, null)

  lazy val snippetStageOutput = new SnippetStage(new Snippet(languageName, exampleSnippet)).run

  val candidateValues = expectedValue.value.values

  def generatePreview(range: Range) = {
    val subStart = {
      val s = range.start - 10
      if (s < 0) 0 else s
    }

    val subEnd = {
      val e = range.end + 10
      if (e > exampleSnippet.length) exampleSnippet.length else e
    }

    s"...${exampleSnippet.substring(subStart, range.start)}<b>${exampleSnippet.substring(range)}</b>${exampleSnippet.substring(range.end, subEnd)}..."
  }

  def extractTokensCandidates: Set[ValueCandidate] = {
    val tokenInterfaces = snippetStageOutput.parser.basicSourceInterface.tokens

    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        tokenInterfaces.tokenTypes.contains(asAstNode.nodeType) &&
        tokenInterfaces.parseNode(asAstNode, snippetStageOutput.astGraph, exampleSnippet.substring(asAstNode))
          .map(value => candidateValues.exists(_ == value)).getOrElse(false)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = tokenInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet.substring(node)).get

        expectedValue.value.filter(_._2 == value).map(i=> Seq(i._1))
        .map(propertyPath=> {
          ValueCandidate(value, generatePreview(node.range), CodeComponent(propertyPath, NodeFinder(node.nodeType, node.range)).withComponentType(Token))
        })
      }
    }.flatten.toSet
  }

  def extractLiteralCandidates: Set[ValueCandidate] = {
    val literalInterfaces = snippetStageOutput.parser.basicSourceInterface.literals

    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        literalInterfaces.literalTypes.contains(asAstNode.nodeType) &&
          literalInterfaces.parseNode(asAstNode, snippetStageOutput.astGraph, exampleSnippet.substring(asAstNode))
            .map(value => candidateValues.exists(_ == value)).getOrElse(false)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = literalInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet.substring(node)).get

        expectedValue.value.filter(_._2 == value).map(i=> Seq(i._1))
          .map(propertyPath=> {
            ValueCandidate(value, generatePreview(node.range), CodeComponent(propertyPath, NodeFinder(node.nodeType, node.range)).withComponentType(Literal))
          })
      }
    }.flatten.toSet
  }

  def extractObjectLiteralCandidates: Set[ValueCandidate] = {
    val objectLiteralInterfaces = snippetStageOutput.parser.basicSourceInterface.objectLiterals
    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        objectLiteralInterfaces.objectLiteralsType.contains(asAstNode.nodeType) &&
          objectLiteralInterfaces.parseNode(asAstNode, snippetStageOutput.astGraph, exampleSnippet)
            .map(value => {
              val trimmedValue = JsonUtils.removeReservedFields(value)
              println(trimmedValue)
              candidateValues.exists(_ == trimmedValue)
            }).getOrElse(false)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = objectLiteralInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet).get

        expectedValue.value.filter(_._2 == JsonUtils.removeReservedFields(value)).map(i=> Seq(i._1))
          .map(propertyPath=> {
            ValueCandidate(value, generatePreview(node.range), CodeComponent(propertyPath, NodeFinder(node.nodeType, node.range)).withComponentType(Literal))
          })
      }
    }.flatten.toSet
  }

}
