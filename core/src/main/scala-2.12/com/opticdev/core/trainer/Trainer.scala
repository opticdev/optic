package com.opticdev.core.trainer

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.common.utils.JsonUtils
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.common.graph.{AstType, CommonAstNode}
import com.opticdev.parsers.{SourceParserManager}
import com.opticdev.parsers.sourcegear.basic.TokenInterfaces
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.skills_sdk.{OMRange, OMSnippet}
import com.opticdev.sdk.skills_sdk.lens._
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json._

import scala.collection.mutable
import scala.util.Try

case class Trainer(languageName: String, exampleSnippet: String, stagedSourceGear: SourceGear = SourceGear.empty) {
  val snippet = OMSnippet(languageName, exampleSnippet)
  implicit val lens = OMLens(Some("trainer-example"), "trainer-output", snippet, Map(), Map(), Map(), Right(OMSchema(
    SchemaRef(Some(PackageRef("optic:trainer")), "trainer"),
    JsObject.empty
  )), JsObject.empty, languageName, PackageRef("optic:trainer"))
  lazy val snippetStageOutput = new SnippetStage(snippet).run

  def returnAllCandidates = Try {
    val basic = extractTokensCandidates ++ extractLiteralCandidates ++ extractObjectLiteralCandidates ++ extractArrayLiteralCandidates

    TrainingResults(
      basic.sortBy(_.stagedComponent.range.start),
      extractContainersCandidates,
      extractVariableCandidates
    )
  }

  //basic interfaces
  def extractTokensCandidates: Seq[ValueCandidate] = {
    val tokenInterfaces = snippetStageOutput.parser.basicSourceInterface.tokens

    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        tokenInterfaces.tokenTypes.contains(asAstNode.nodeType)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = tokenInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet.substring(node)).get
          ValueCandidate(value, generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](Seq(), OMLensCodeComponent(Token, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
            JsObject(Seq("type" -> JsString("string")))
          )
      }
    }.toSeq
  }

  def extractLiteralCandidates: Seq[ValueCandidate] = {
    val literalInterfaces = snippetStageOutput.parser.basicSourceInterface.literals

    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        literalInterfaces.literalTypes.contains(asAstNode.nodeType)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = literalInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet.substring(node)).get

        val jsontype = value match {
          case a:JsString => JsString("string")
          case n:JsNumber => JsString("number")
          case b:JsBoolean => JsString("boolean")
        }

        ValueCandidate(value, generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](Seq(), OMLensCodeComponent(Literal, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
          JsObject(Seq("type" -> jsontype))
        )
      }
    }.toSeq
  }

  def extractObjectLiteralCandidates: Seq[ValueCandidate] = {
    val objectLiteralInterfaces = snippetStageOutput.parser.basicSourceInterface.objectLiterals
    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        objectLiteralInterfaces.objectLiteralsType.contains(asAstNode.nodeType)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = objectLiteralInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet).get

        ValueCandidate((value.as[JsObject] - "_order"), generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](Seq(), OMLensCodeComponent(ObjectLiteral, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
          JsObject(Seq("type" -> JsString("object")))
        )
      }
    }.toSeq
  }

  def extractArrayLiteralCandidates: Seq[ValueCandidate] = {
    val arrayLiteralInterfaces = snippetStageOutput.parser.basicSourceInterface.arrayLiterals
    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        arrayLiteralInterfaces.arrayLiteralsType.contains(asAstNode.nodeType)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = arrayLiteralInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet).get

        ValueCandidate(value, generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](Seq(), OMLensCodeComponent(ArrayLiteral, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
          JsObject(Seq("type" -> JsString("array")))
        )

      }
    }.toSeq
  }

  //map schema interfaces
//  def extractMapSchemaCandidates = {
//    implicit val sourceGearContext = SGContext(stagedSourceGear.fileAccumulator, snippetStageOutput.astGraph, snippetStageOutput.parser, exampleSnippet, stagedSourceGear, null)
//    val fileParseResults = stagedSourceGear.lensSet.parseFromGraph(exampleSnippet, snippetStageOutput.astGraph, sourceGearContext, null, None)
//  }

  //containers
  def extractContainersCandidates: Seq[ContainerCandidate] = {
    snippetStageOutput.containerMapping.map(i=>
      ContainerCandidate(i._1.name, generatePreview(i._2.node.range), OMLensNodeFinder(i._2.node.nodeType.name, OMRange(i._2.node.range))))
//      ContainerCandidate(i._1.name, "PREVIEW HIJACKED", OMLensNodeFinder(i._2.node.nodeType.name, OMRange(i._2.node.range))))
      .toSeq
      .sortBy(_.nodeFinder.range.start)
  }

  //variables
  def extractVariableCandidates: Seq[VariableCandidate] = {
    val tokenInterfaces = snippetStageOutput.parser.basicSourceInterface.tokens

    val allTokens =
    snippetStageOutput.astGraph.nodes.collect {
      case n if n.value.isAstNode() && {
        val asAstNode = n.value.asInstanceOf[CommonAstNode]
        tokenInterfaces.tokenTypes.contains(asAstNode.nodeType)
      } => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = tokenInterfaces.parseNode(node, snippetStageOutput.astGraph, snippetStageOutput.snippet.block.substring(node)).get

        (value.as[JsString].value, node)
      }
    }

    val allTokensGrouped: Map[String, Seq[CommonAstNode]] = allTokens.groupBy(_._1).mapValues(_.map(_._2).toSeq.sortBy(_.range.start))
    allTokensGrouped.map {
      case (name, found) => VariableCandidate(name, found.map(_.range))
    }.toSeq.sortBy(_.occurrences.size).reverse
  }

  //formatters
  def generatePreview(range: Range) = {

    val finalSnippet = snippetStageOutput.snippet.block

    val subStart = {
      val s = range.start - 10
      if (s < 0) 0 else s
    }

    val subEnd = {
      val e = range.end + 10
      if (e > finalSnippet.length) finalSnippet.length else e
    }

    import scala.xml.Utility.escape
    s"...${escape(finalSnippet.substring(subStart, range.start))}<b>${escape(finalSnippet.substring(range))}</b>${escape(finalSnippet.substring(range.end, subEnd))}..."
  }
}
