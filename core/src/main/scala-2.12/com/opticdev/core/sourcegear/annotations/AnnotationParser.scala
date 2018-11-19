package com.opticdev.core.sourcegear.annotations

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.parsers.ParserBase
import com.opticdev.common.graph.{BaseNode, CommonAstNode}
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.annotations.dsl._
import com.opticdev.core.utils.TryWithErrors
import com.opticdev.marvin.common.helpers.InRangeImplicits._
import com.opticdev.sdk.descriptions.transformation.TransformationRef

import scala.util.{Failure, Success, Try}
import scala.util.matching.Regex

object AnnotationParser {

  def annotationsFromFile(contents: String)(implicit parserBase: ParserBase, file: File): Vector[(Int, ObjectAnnotation)] = {
    def isType(operationNode: TryWithErrors[OperationNode, AnnotationParseError, ParseContext], t: String) = {
      operationNode.isSuccess && t == operationNode.get.nodeType
    }

    val allAnnotationLines = findAllAnnotationComments(parserBase.inlineCommentPrefix, parserBase.blockCommentRegex, contents)
    allAnnotationLines.map{ case (lineNumber, line) =>
      (lineNumber, AnnotationsDslParser.parseSingleLine(line)(ParseContext(file, lineNumber)))
    }.collect {
      case (line, n) if isType(n, "NameOperationNode") =>
        (line, NameAnnotation(n.get.asInstanceOf[NameOperationNode].name, null))
      case (line, n) if isType(n, "TagOperationNode") =>
        (line, TagAnnotation(n.get.asInstanceOf[TagOperationNode].name, null))
      case (line, n) if isType(n, "SourceOperationNode") => {
        val sourceOperationNode = n.get.asInstanceOf[SourceOperationNode]
        (line, SourceAnnotation(
          sourceOperationNode.project,
          sourceOperationNode.name,
          sourceOperationNode.relationshipId.get, //@todo make implicit if not specified
          sourceOperationNode.answers)
        )
      }
    }
  }

  def contentsToCheck(node: CommonAstNode)(implicit fileContents: String) = {
    val range = node.range
    val startLine = LineOperations.lineOf(range.start, fileContents)
    val endLine = LineOperations.lineOf(range.end, fileContents)

    if (startLine == endLine) {
      val lines = fileContents.substring(range.start).linesWithSeparators
      if (lines.nonEmpty) lines.next() else ""
    } else {
      fileContents.substring(node)
    }
  }

  def findAnnotationComment(inlineCommentPrefix: String, contents: String) : Option[String] = {
    val result = contents.lastIndexOf(inlineCommentPrefix)
    if (result == -1) None else Some(contents.substring(result))
  }

  def inlineAnnotationComments(inlineCommentPrefix: String, contents: String) : Vector[(Int, String)] = {
    contents
      .lines.zipWithIndex
      .map{ case(line, index) =>
        findAnnotationComment(inlineCommentPrefix, line).map(l=> (index+1, l.trim.substring(inlineCommentPrefix.length)))
      }
      .collect{case a if a.isDefined => a.get}
      .toVector
  }

  def findBlockAnnotationComments(blockCommentRegex: Regex, contents: String) : Vector[(Int, String)] = {
    blockCommentRegex.findAllIn(contents).matchData.flatMap(i=> {
      val innerContents = i.group(1)
      import com.opticdev.common.utils.RangeToLine._
      val lastLine = Range(i.start, i.end).toLineRange(contents).end

      innerContents.lines.collect{ case line if line.trim.nonEmpty => (lastLine + 1, line.trim) } //all will share the same last line, end of block + 2, 0 offset, (start of new model)
    })
  }.toVector

  def findAllAnnotationComments(inlineCommentPrefix: String, blockCommentRegex: Regex, contents: String) : Vector[(Int, String)] = {
    (inlineAnnotationComments(inlineCommentPrefix, contents) ++
    findBlockAnnotationComments(blockCommentRegex, contents)).sortBy(_._1)
  }

}
