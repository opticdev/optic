package sdk.descriptions.Finders
import cognitro.parsers.GraphUtils.AstPrimitiveNode
import compiler_new.SnippetStageOutput
import compiler_new.errors.{NodeContainingStringNotFound, NodeStartingWithStringNotFound, StringNotFound, StringOccurrenceOutOfBounds}
import sdk.descriptions.Finders.Finder.StringRules
import sdk.descriptions.Lens

import scala.util.control.Breaks._

case class StringFinder(rule: Finder.StringRules.Value, string: String, occurrence: Int = 0) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = {

    val regex = string.r

    val matches = regex.findAllMatchIn(snippetStageOutput.raw.block).toVector

    //not found at all
    if (matches.size == 0) throw new StringNotFound(this)

    val matchOption = matches.lift(occurrence)

    //occurrence not found
    if (matchOption.isEmpty) throw new StringOccurrenceOutOfBounds(this, matches.size)

    val (start, end) = (matchOption.get.start, matchOption.get.end)

    rule match {
      //offload to a range finder. search for exact matches, least graph depth
      case StringRules.Entire => RangeFinder(start, end).evaluateFinder(snippetStageOutput)

      //node with deepest graph depth that contains entire string
      case StringRules.Containing => {
        val containingNodes = RangeFinder.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart <= start && nEnd >= end
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw new NodeContainingStringNotFound(this)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }

      //node with least graph depth that starts with string
      case StringRules.Starting => {
        val containingNodes = RangeFinder.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart == start
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw new NodeStartingWithStringNotFound(this)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }
    }

  }
}
