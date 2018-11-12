package com.opticdev.core.sourcegear.annotations

import com.opticdev.common.PackageRef
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers.ParserBase
import com.opticdev.common.graph.{BaseNode, CommonAstNode}
import com.opticdev.common.SchemaRef
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.descriptions.transformation.TransformationRef

import scala.util.{Failure, Success, Try}
import scala.util.matching.Regex

object AnnotationParser {

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

  def extractFromFileContents(fileContents: String, inlineCommentPrefix: String): Set[FileNameAnnotation] = {
    val lineContents = fileContents.lines.toVector.headOption.getOrElse("")
    val foundAnnotations = findAnnotationComment(inlineCommentPrefix, lineContents)
                            .map(_.substring(inlineCommentPrefix.length))
                            .map(extractRawAnnotationsFromLine).getOrElse(Map.empty)
    foundAnnotations.map {
      case (name, value) if name == "filename" => Some(FileNameAnnotation(value.name))
      case _ => None
    }.collect {case Some(a)=> a}
      .toSet
  }

  def extractRawAnnotationsFromLine(string: String) : Map[String, AnnotationValues] = {
    if (topLevelCapture.pattern.matcher(string).matches()) {
      val extracts = propertiesCapture.findAllIn(string).matchData.map {
        i =>
          Try {
            val fullString = i.source

            val key = i.group("key").trim
            val name = i.group("name").trim

            val value: AnnotationValues = key match {
              case "source" => {
                transformationCapture.findFirstMatchIn(fullString).map { case m =>
                  val name = m.group("name").trim
                  val namespace = m.group("namespace")
                  val packageName = m.group("packageName")
                  val askOption = Option(m.group("askJson"))
                  val version = Option(m.group("version")).getOrElse("latest")
                  val id = m.group("id")

                  require(!Set(namespace, packageName, version, id).contains(null))

                  val transformationRef = TransformationRef(Some(PackageRef(namespace + ":" + packageName, version)), id)

                  ExpressionValue(name, transformationRef, askOption)
                }.get
              }
              case "name" => StringValue(name)
              case "tag" => StringValue(name)
              case "filename" => StringValue(name)
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
