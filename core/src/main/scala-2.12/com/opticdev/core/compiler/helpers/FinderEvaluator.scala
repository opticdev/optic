package com.opticdev.core.compiler.helpers

import com.opticdev.core.compiler.SnippetStageOutput
import com.opticdev.core.compiler.errors._
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, BaseNode}
import com.opticdev.parsers.graph.path.{PathFinder, WalkablePath}
import com.opticdev.sdk.descriptions.Lens
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.sdk.descriptions.finders.{Finder, NodeFinder, RangeFinder, StringFinder}

import scala.util.matching.Regex

object FinderEvaluator {
  def run(finder: Finder, snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = finder match {
    case f: StringFinder => forStringFinder(f, snippetStageOutput)
    case f: RangeFinder => forRangeFinder(f, snippetStageOutput)
    case f: NodeFinder => forNodeFinder(f, snippetStageOutput)
  }

  def finderPath(finder: Finder, snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : FinderPath = {
    val result = run(finder, snippetStageOutput)

    val basicSourceInterface = snippetStageOutput.parser.basicSourceInterface

    new FinderPath {
      override def fromNode(root: AstPrimitiveNode): Option[WalkablePath] =
        PathFinder.getPath(snippetStageOutput.astGraph, root, result)

      override val targetNode: AstPrimitiveNode = result
      override val astGraph : AstGraph = snippetStageOutput.astGraph

      override def leadsToLiteral = basicSourceInterface.literals.literalTypes.contains(targetNode.nodeType)
      override def leadsToToken = basicSourceInterface.tokens.tokenTypes.contains(targetNode.nodeType)
      override def leadsToObjectLiteral = basicSourceInterface.objectLiterals.objectLiteralsType.contains(targetNode.nodeType)
    }
  }

  def forNodeFinder(finder: NodeFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = {
    val nodeOption = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
      (finder.range.start, finder.range.end) == (nStart, nEnd)
    }).find(_.value.asInstanceOf[AstPrimitiveNode].nodeType == finder.astType)

    if (nodeOption.isDefined) nodeOption.get.value.asInstanceOf[AstPrimitiveNode] else throw NodeNotFound(finder)

  }

  def forStringFinder(finder: StringFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = {

    val string = finder.string
    val rule   = finder.rule
    val occurrence = finder.occurrence

    val regex = Regex.quote(string).r

    val matches = regex.findAllMatchIn(snippetStageOutput.snippet.block).toVector

    //not found at all
    if (matches.isEmpty) throw StringNotFound(finder)

    val matchOption = matches.lift(occurrence)

    //occurrence not found
    if (matchOption.isEmpty) throw StringOccurrenceOutOfBounds(finder, matches.size)

    val (start, end) = (matchOption.get.start, matchOption.get.end)

    rule match {
      //offload to a range finder. search for exact matches, least graph depth
      case Entire => run(RangeFinder(start, end), snippetStageOutput)

      //node with deepest graph depth that contains entire string
      case Containing => {
        val containingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart <= start && nEnd >= end
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw NodeContainingStringNotFound(finder)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }

      //node with least graph depth that starts with string
      case Starting => {
        val containingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart == start
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw NodeStartingWithStringNotFound(finder)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }
    }


  }
  def forRangeFinder(finder: RangeFinder, snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = {

    val start = finder.start
    val end   = finder.end

    val exactMatchingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
      (start, end) == (nStart, nEnd)
    })

    val node = exactMatchingNodes.sortBy(i=> i.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph)).reverse.headOption

    if (node.isDefined) node.get.value.asInstanceOf[AstPrimitiveNode] else throw new NodeWithRangeNotFound(finder)
  }

  object RangeFinderEvaluate {
    def nodesMatchingRangePredicate(graph: AstGraph, predicate: (Int, Int) => Boolean) : Seq[graph.NodeT] = {
      graph.nodes.filter((n: graph.NodeT) => {
        n.isAstNode() && {
          val range = n.value.asInstanceOf[AstPrimitiveNode].range
          n.value.isAstNode() && predicate(range.start, range.end)
        }
      }).toSeq
    }
  }

}
