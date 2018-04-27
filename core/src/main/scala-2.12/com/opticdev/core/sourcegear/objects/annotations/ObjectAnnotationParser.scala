package com.opticdev.core.sourcegear.objects.annotations

import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers.ParserBase
import com.opticdev.parsers.graph.{BaseNode, CommonAstNode}
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import scala.util.matching.Regex

object ObjectAnnotationParser {

  def extract(string: String, schemaRef: SchemaRef)(implicit parserBase: ParserBase) : Set[ObjectAnnotation]  =
    extract(string, schemaRef, parserBase.inlineCommentPrefix)

  def extract(string: String, schemaRef: SchemaRef, inlineCommentPrefix: String) : Set[ObjectAnnotation] = {
    val lineRegex = annotationRegex(inlineCommentPrefix)

    if (string.isEmpty) return Set()

    val found = {
      val lineContents = string.lines.next()
      lineRegex.findFirstIn(lineContents).map(i=> extractRawAnnotationsFromLine(i.substring(2)))
    }.map(_.map(pair=> {
      pair._1 match {
        case "name" => Some(NameAnnotation(pair._2, schemaRef))
//        case "source" => Some()
        case _ => None
      }
    }).collect {case Some(a)=> a}
      .toSet.asInstanceOf[Set[ObjectAnnotation]])

    found.getOrElse(Set())
  }

  def extractRawAnnotationsFromLine(string: String) : Map[String, String] = {
    if (topLevelCapture.pattern.matcher(string).matches()) {
      propertiesCapture.findAllIn(string).matchData.map(i=> {
        (i.group(1).trim, i.group(2).trim)
      }).toMap
    } else Map.empty
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

  //@todo make this lazy...
  def annotationRegex(inlineCommentPrefix: String) : Regex =
    ("["+Regex.quote(inlineCommentPrefix)+"](.+)$").r

}
