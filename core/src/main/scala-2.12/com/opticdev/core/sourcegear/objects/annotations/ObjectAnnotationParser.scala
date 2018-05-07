package com.opticdev.core.sourcegear.objects.annotations

import com.opticdev.common.PackageRef
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers.ParserBase
import com.opticdev.parsers.graph.{BaseNode, CommonAstNode}
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.descriptions.transformation.TransformationRef

import scala.util.{Failure, Success, Try}
import scala.util.matching.Regex

object ObjectAnnotationParser {

  def extract(string: String, schemaRef: SchemaRef)(implicit parserBase: ParserBase) : Set[ObjectAnnotation]  =
    extract(string, schemaRef, parserBase.inlineCommentPrefix)

  def extract(string: String, schemaRef: SchemaRef, inlineCommentPrefix: String) : Set[ObjectAnnotation] = {
    if (string.isEmpty) return Set()

    val found = {
      val lineContents = string.lines.next()
      val lastComment = findAnnotationComment(inlineCommentPrefix, lineContents)
      lastComment.map(i=> extractRawAnnotationsFromLine(i.substring(inlineCommentPrefix.size)))
    }.map(_.map(pair=> {
      pair._1 match {
        case "name" => Some(NameAnnotation(pair._2.name, schemaRef))
        case "source" => pair._2 match {
          case exp: ExpressionValue => {
            Some(SourceAnnotation(exp.name, exp.transformationRef, exp.askJsObject))
          }
          case _ => None
        }
        case "tag" => Some(TagAnnotation(pair._2.name, schemaRef))
        case _ => None
      }
    }).collect {case Some(a)=> a}
      .toSet.asInstanceOf[Set[ObjectAnnotation]])

    found.getOrElse(Set())
  }

  def extractRawAnnotationsFromLine(string: String) : Map[String, AnnotationValues] = {
    if (topLevelCapture.pattern.matcher(string).matches()) {
      val extracts = propertiesCapture.findAllIn(string).matchData.map {
        i =>
          Try {
            val key = i.group("key").trim
            val name = i.group("name").trim
            val transform  = i.group("transformRef")
            val askOption = Option(i.group("askJson"))

            val value = if (transform != null) {

              val namespace = i.group("namespace")
              val packageName = i.group("packageName")
              val version = Option(i.group("version")).getOrElse("latest")
              val id = i.group("id")

              require(!Set(namespace, packageName, version, id).contains(null))

              val transformationRef = TransformationRef(Some(PackageRef(namespace + ":" + packageName, version)), id)

              ExpressionValue(name, transformationRef, askOption)
            } else {
              StringValue(name)
            }

            (key, value)
          }
      }
      extracts.collect {case Success(a) => a} .toMap
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

  def findAnnotationComment(inlineCommentPrefix: String, contents: String) : Option[String] = {
    val result = contents.lastIndexOf(inlineCommentPrefix)
    if (result == -1) None else Some(contents.substring(result))
  }

}
