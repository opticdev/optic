package com.opticdev.core.sourcegear.annotations

import com.opticdev.common.PackageRef
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers.ParserBase
import com.opticdev.common.graph.{BaseNode, CommonAstNode}
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.annotations.dsl.{AnnotationsDslParser, NameOperationNode, ParseContext}
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.descriptions.transformation.TransformationRef

import scala.util.{Failure, Success, Try}
import scala.util.matching.Regex

object AnnotationParser {

  def extract(string: String, schemaRef: SchemaRef)(implicit parserBase: ParserBase, parseContext: ParseContext) : Set[ObjectAnnotation]  =
    extract(string, schemaRef, parserBase.inlineCommentPrefix)

  def extract(string: String, schemaRef: SchemaRef, inlineCommentPrefix: String)(implicit parseContext: ParseContext) : Set[ObjectAnnotation] = {
    if (string.isEmpty) return Set()

    val found = {
      val lineContents = string.lines.next()
      val comment = findAnnotationComment(inlineCommentPrefix, lineContents)
      comment.map(i => {
        val innerContents = i.substring(inlineCommentPrefix.length)
        AnnotationsDslParser.parseSingleLine(innerContents)
      })
    }.collect {
      case na if na.isSuccess && na.get.nodeType == "NameOperationNode" =>
        NameAnnotation(na.get.asInstanceOf[NameOperationNode].name, schemaRef)
    }

    if (found.isDefined) Set(found.get) else Set()
  }

  def contentsToCheck(node: CommonAstNode)(implicit fileContents: String) = {
    val range = node.range
    val startLine = LineOperations.lineOf(range.start, fileContents)
    val endLine = LineOperations.lineOf(range.end, fileContents)

    if (startLine == endLine) {
      val lines = fileContents.substring(range.start).lines
      if (lines.nonEmpty) lines.next() else ""
    } else {
      fileContents.substring(node)
    }
  }

  def findAnnotationComment(inlineCommentPrefix: String, contents: String) : Option[String] = {
    val result = contents.lastIndexOf(inlineCommentPrefix)
    if (result == -1) None else Some(contents.substring(result))
  }

  def findAllAnnotationComments(inlineCommentPrefix: String, contents: String) : Vector[String] = {
    contents
      .lines
      .map(findAnnotationComment(inlineCommentPrefix, _))
      .collect{case a if a.isDefined => a.get}
      .toVector
  }

}
