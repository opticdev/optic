package com.opticdev.core.compiler.helpers

import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.compiler.errors._
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{BaseNode, CommonAstNode}
import com.opticdev.parsers.graph.path.{PathFinder, WalkablePath}
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.sdk.skills_sdk.lens._

import scala.util.matching.Regex

object FinderEvaluator {
  def run(finder: OMFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: OMLens) : CommonAstNode = finder match {
    case f: OMLensNodeFinder => forNodeFinder(f, snippetStageOutput)
    case f: OMStringFinder => forStringFinder(f, snippetStageOutput)
    case f: OMRangeFinder => forRangeFinder(f, snippetStageOutput)
  }

  def finderPath(finder: OMFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: OMLens) : FinderPath = {
    val result = run(finder, snippetStageOutput)

    val basicSourceInterface = snippetStageOutput.parser.basicSourceInterface

    new FinderPath {
      override def fromNode(root: CommonAstNode): Option[WalkablePath] =
        PathFinder.getPath(snippetStageOutput.astGraph, root, result)

      override val targetNode: CommonAstNode = result
      override val astGraph : AstGraph = snippetStageOutput.astGraph

      override def leadsToLiteral = basicSourceInterface.literals.literalTypes.contains(targetNode.nodeType)
      override def leadsToToken = basicSourceInterface.tokens.tokenTypes.contains(targetNode.nodeType)
      override def leadsToObjectLiteral = basicSourceInterface.objectLiterals.objectLiteralsType.contains(targetNode.nodeType)
    }
  }

  def forNodeFinder(finder: OMLensNodeFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: OMLens) : CommonAstNode = {
    val nodeOption = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
      (finder.range.start, finder.range.end) == (nStart, nEnd)
    }).find(_.value.asInstanceOf[CommonAstNode].nodeType.name == finder.astType)

    if (nodeOption.isDefined) nodeOption.get.value.asInstanceOf[CommonAstNode] else throw NodeNotFound(finder)
  }

  def forStringFinder(finder: OMStringFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: OMLens) : CommonAstNode = {

    val string = finder.string
    val rule   = finder.rule
    val occurrence = finder.occurrence

    val regex = Regex.quote(string).r

    val matches = regex.findAllMatchIn(snippetStageOutput.snippet.block).toVector

    //not found at all
    if (matches.isEmpty) throw new Error(finder.toDebugString)

    val matchOption = matches.lift(occurrence)

    //occurrence not found
    if (matchOption.isEmpty) throw new Error(finder.toDebugString)

    val (start, end) = (matchOption.get.start, matchOption.get.end)

    rule match {
      //offload to a range finder. search for exact matches, least graph depth
      case Entire => run(OMRangeFinder(start, end), snippetStageOutput)

      //node with deepest graph depth that contains entire string
      case Containing => {
        val containingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart <= start && nEnd >= end
        }).sortBy(_.value.asInstanceOf[CommonAstNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw new Error(finder.toDebugString)
        else nodeOption.get.value.asInstanceOf[CommonAstNode]
      }

      //node with least graph depth that starts with string
      case Starting => {
        val containingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart == start
        }).sortBy(_.value.asInstanceOf[CommonAstNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw new Error(finder.toDebugString)
        else nodeOption.get.value.asInstanceOf[CommonAstNode]
      }
    }
  }

  def forRangeFinder(finder: OMRangeFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: OMLens) : CommonAstNode = {

    val start = finder.start
    val end   = finder.end

    val exactMatchingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
      (start, end) == (nStart, nEnd)
    })

    val node = exactMatchingNodes.sortBy(i=> i.value.asInstanceOf[CommonAstNode].graphDepth(snippetStageOutput.astGraph)).reverse.headOption

    if (node.isDefined) node.get.value.asInstanceOf[CommonAstNode] else throw new Error(finder.toDebugString)
  }

  object RangeFinderEvaluate {
    def nodesMatchingRangePredicate(graph: AstGraph, predicate: (Int, Int) => Boolean) : Seq[graph.NodeT] = {
      graph.nodes.filter((n: graph.NodeT) => {
        n.isAstNode() && {
          val range = n.value.asInstanceOf[CommonAstNode].range
          n.value.isAstNode() && predicate(range.start, range.end)
        }
      }).toSeq
    }
  }

}
