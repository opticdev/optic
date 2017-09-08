package sdk.descriptions.Finders

import compiler.SnippetStageOutput
import compiler.errors._
import optic.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import optic.parsers.graph.path.{PathFinder, WalkablePath}
import play.api.libs.json._
import sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting, StringEnums}
import sdk.descriptions.{Description, Lens}
import optic.parsers.types.GraphTypes.AstGraph

import scala.util.matching.Regex
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object Finder extends Description[Finder] {


  private implicit val stringFinderReads : Reads[StringFinder] = Json.reads[StringFinder]
  private implicit val rangeFinderReads : Reads[RangeFinder] = Json.reads[RangeFinder]
  private implicit val nodeFinderReads : Reads[NodeFinder] = Json.reads[NodeFinder]


  implicit val finderReads = new Reads[Finder] {
    override def reads(json: JsValue): JsResult[Finder] = {
      try {
        JsSuccess(Finder.fromJson(json))
      } catch {
        case _=> JsError()
      }
    }
  }

  override def fromJson(jsValue: JsValue): Finder = {
    val finderType = (jsValue \ "type")

    if (finderType.isDefined && finderType.get.isInstanceOf[JsString]) {
      val result : JsResult[Finder]= finderType.get.as[JsString].value match {
        case "string"=> Json.fromJson[StringFinder](jsValue)
        case "range"=> Json.fromJson[RangeFinder](jsValue)
        case "node"=> Json.fromJson[NodeFinder](jsValue)
        case _=> throw new Error("Finder Parsing Failed. Invalid Type "+finderType.get)
      }

      if (result.isSuccess) {
        result.get
      } else {
        throw new Error("Finder Parsing Failed "+result)
      }

    } else {
      throw new Error("Finder Parsing Failed. Type not provided.")
    }

  }
}


abstract class FinderPath {
  val targetNode: AstPrimitiveNode
  val astGraph : AstGraph
  def fromNode(astPrimitiveNode: AstPrimitiveNode) : Option[WalkablePath]
}

sealed trait Finder {
  def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode
  def evaluateFinderPath(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : FinderPath = {
    val result = evaluateFinder(snippetStageOutput)
    new FinderPath {
      override def fromNode(root: AstPrimitiveNode): Option[WalkablePath] =
        PathFinder.getPath(snippetStageOutput.astGraph, root, result)

      override val targetNode: AstPrimitiveNode = result
      override val astGraph : AstGraph = snippetStageOutput.astGraph
    }
  }
}

//@todo get these into different files. Picklers need them all here for some reason even though sealed should be package, not file specific
case class StringFinder(rule: StringEnums, string: String, occurrence: Int = 0) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode = {

    val regex = Regex.quote(string).r

    val matches = regex.findAllMatchIn(snippetStageOutput.snippet.block).toVector

    //not found at all
    if (matches.isEmpty) throw StringNotFound(this)

    val matchOption = matches.lift(occurrence)

    //occurrence not found
    if (matchOption.isEmpty) throw StringOccurrenceOutOfBounds(this, matches.size)

    val (start, end) = (matchOption.get.start, matchOption.get.end)

    rule match {
      //offload to a range finder. search for exact matches, least graph depth
      case Entire => RangeFinder(start, end).evaluateFinder(snippetStageOutput)

      //node with deepest graph depth that contains entire string
      case Containing => {
        val containingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart <= start && nEnd >= end
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw NodeContainingStringNotFound(this)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }

      //node with least graph depth that starts with string
      case Starting => {
        val containingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
          nStart == start
        }).sortBy(_.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph))

        val nodeOption = containingNodes.lastOption

        if (nodeOption.isEmpty) throw NodeStartingWithStringNotFound(this)
        else nodeOption.get.value.asInstanceOf[AstPrimitiveNode]
      }
    }

  }
}

case class NodeFinder(enterOn: String, block: String) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens): AstPrimitiveNode = ???
}

case class RangeFinder(start: Int, end: Int) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens): AstPrimitiveNode = {

    val exactMatchingNodes = RangeFinderEvaluate.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
      (start, end) == (nStart, nEnd)
    })

    val node = exactMatchingNodes.sortBy(i=> i.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph)).reverse.headOption

    if (node.isDefined) node.get.value.asInstanceOf[AstPrimitiveNode] else throw new NodeWithRangeNotFound(this)
  }
}

object RangeFinderEvaluate {

  def nodesMatchingRangePredicate(graph: AstGraph, predicate: (Int, Int)=> Boolean) = {
    graph.nodes.filter((n: graph.NodeT)=> {
      n.isAstNode() && {
        val (start, end) = n.value.asInstanceOf[AstPrimitiveNode].range
        n.value.isAstNode() && predicate(start, end)
      }
    }).toSeq
  }

}