package sdk.descriptions.Finders

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import cognitro.parsers.GraphUtils.Path.{PathFinder, WalkablePath}
import compiler_new.SnippetStageOutput
import play.api.libs.json._
import sdk.descriptions.{Description, Lens}
import sdk.descriptions.helpers.{EnumReader, ParsableEnum}

import scala.util.control.Breaks._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object Finder extends Description[Finder] {

  object StringRules extends ParsableEnum {
    val Entire, Containing, Starting = Value
    override val mapping: Map[String, Value] = Map("entire"-> Entire, "containing"-> Containing, "starting"-> Starting)
  }

  private implicit val stringRulesReads = EnumReader.forEnum(StringRules)

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
      throw new Error("Finder Parsing Failed. Invalid Type.")
    }

  }
}


abstract class FinderPath {
  val targetNode: AstPrimitiveNode
  val astGraph : Graph[BaseNode, LkDiEdge]
  def fromNode(astPrimitiveNode: AstPrimitiveNode) : Option[WalkablePath]
}

trait Finder {
  def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : AstPrimitiveNode
  def evaluateFinderPath(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens) : FinderPath = {
    val result = evaluateFinder(snippetStageOutput)
    new FinderPath {
      override def fromNode(root: AstPrimitiveNode): Option[WalkablePath] =
        PathFinder.getPath(snippetStageOutput.astGraph, root, result)

      override val targetNode: AstPrimitiveNode = result
      override val astGraph : Graph[BaseNode, LkDiEdge] = snippetStageOutput.astGraph
    }
  }
}
