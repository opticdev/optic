package com.opticdev.core.trainer

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.common.utils.JsonUtils
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.parsers.{AstGraph, SourceParserManager}
import com.opticdev.parsers.sourcegear.basic.TokenInterfaces
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.opticmarkdown2.{OMRange, OMSnippet}
import com.opticdev.sdk.opticmarkdown2.lens._
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import play.api.libs.json._

import scala.collection.mutable
import scala.util.Try

case class Trainer(filePath: String, languageName: String, exampleSnippet: String, expectedValue: JsObject, stagedSourceGear: SourceGear = SourceGear.empty) {
  val snippet = OMSnippet(languageName, exampleSnippet)
  implicit val lens = OMLens(Some("trainer-example"), "trainer-output", snippet, Map(), Map(), Map(), Right(OMSchema(
    SchemaRef(Some(PackageRef("optic:trainer")), "trainer"),
    JsObject.empty
  )), JsObject.empty, PackageRef("optic:trainer"))
  lazy val snippetStageOutput = new SnippetStage(snippet).run

  val candidateValues = expectedValue.value.values

  def this(filePath: String, languageName: String, exampleSnippet: String, expectedValue: String) = {
    this(filePath, languageName, exampleSnippet, Try(Json.parse(expectedValue).as[JsObject]).getOrElse(throw new Exception("Expected Value was not a valid JSON Object")))
  }

  def returnAllCandidates = Try {
    val basic = extractTokensCandidates ++ extractLiteralCandidates ++ extractObjectLiteralCandidates

    val withKeysAsPropertyPaths = expectedValue.value.map(i=> (Seq(i._1), i._2))
    val keysAsPropertyPaths = withKeysAsPropertyPaths.keys.toSet

    val withSortedResults =
    basic.groupBy(_.propertyPath)
      .mapValues(_.toSeq.sortBy(_.stagedComponent.range.start))

    val notFoundProperties = keysAsPropertyPaths diff withSortedResults.keys.toSet



    TrainingResults(
      withSortedResults.map(i=> (i._1.mkString("."), i._2)),
      notFoundProperties.map(_.mkString(".")).toSeq,
      JsObject(notFoundProperties.map(i=> (i.mkString("."), withKeysAsPropertyPaths(i))).toSeq),
      extractContainersCandidates,
      extractVariableCandidates
    )
  }

  //basic interfaces
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
          ValueCandidate(value, generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](propertyPath, OMLensCodeComponent(Token, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
            JsObject(Seq("type" -> JsString("string")))
          )
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

        val jsontype = value match {
          case a:JsString => JsString("string")
          case n:JsNumber => JsString("number")
          case b:JsBoolean => JsString("boolean")
        }

        expectedValue.value.filter(_._2 == value).map(i=> Seq(i._1))
          .map(propertyPath=> {
            ValueCandidate(value, generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](propertyPath, OMLensCodeComponent(Literal, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
              JsObject(Seq("type" -> jsontype))
            )
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
              candidateValues.exists(_ == trimmedValue)
            }).getOrElse(false)
      }  => {
        val node = n.value.asInstanceOf[CommonAstNode]
        val value = objectLiteralInterfaces.parseNode(node, snippetStageOutput.astGraph, exampleSnippet).get

        expectedValue.value.filter(_._2 == JsonUtils.removeReservedFields(value)).map(i=> Seq(i._1))
          .map(propertyPath=> {
            ValueCandidate((value.as[JsObject] - "_order"), generatePreview(node.range), OMComponentWithPropertyPath[OMLensCodeComponent](propertyPath, OMLensCodeComponent(ObjectLiteral, OMLensNodeFinder(node.nodeType.name, OMRange(node.range)))),
              JsObject(Seq("type" -> JsString("object")))
            )
          })
      }
    }.flatten.toSet
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
