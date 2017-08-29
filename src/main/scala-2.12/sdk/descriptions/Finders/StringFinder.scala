package sdk.descriptions.Finders
import cognitro.parsers.GraphUtils.AstPrimitiveNode
import compiler_new.SnippetStageOutput
import compiler_new.errors.{NodeContainingStringNotFound, NodeStartingWithStringNotFound, StringNotFound, StringOccurrenceOutOfBounds}
import sdk.descriptions.Lens
import sdk.descriptions.enums.FinderEnums._

import scala.util.control.Breaks._

case class StringFinder(rule: StringEnums, string: String, occurrence: Int = 0) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = {

    val regex = string.r

    val matches = regex.findAllMatchIn(snippetStageOutput.snippet.block).toVector

    //not found at all
    if (matches.size == 0) throw StringNotFound(this)

    val matchOption = matches.lift(occurrence)

    //occurrence not found
    if (matchOption.isEmpty) throw StringOccurrenceOutOfBounds(this, matches.size)

    val (start, end) = (matchOption.get.start, matchOption.get.end)

    rule match {
      //offload to a range finder. search for exact matches, least graph depth
      case Entire => RangeFinder(start, end).evaluateFinder(snippetStageOutput)

      //node with deepest graph depth that contains entire string
      case Containing => {
        val containingNodes = RangeFinder.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart <= start && nEnd >= end
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw NodeContainingStringNotFound(this)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }

      //node with least graph depth that starts with string
      case Starting => {
        val containingNodes = RangeFinder.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart == start
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw NodeStartingWithStringNotFound(this)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }
    }

  }
}
