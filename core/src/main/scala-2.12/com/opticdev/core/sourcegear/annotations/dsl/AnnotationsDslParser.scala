package com.opticdev.core.sourcegear.annotations.dsl

import play.api.libs.json.{JsObject, Json}

import scala.collection.mutable
import scala.collection.mutable.ListBuffer
import scala.util.Try
import scala.util.matching.Regex
import RegexHelper._
import com.opticdev.core.utils.TryWithErrors
import com.opticdev.core.namedObjectRegex
import com.opticdev.sdk.descriptions.transformation.TransformationRef

object AnnotationsDslParser {

  def parseMultipleLines(lines: Vector[String], excludeFailures: Boolean = true)(implicit parseContext: ParseContext) : Vector[TryWithErrors[OperationNode, AnnotationParseError, ParseContext]] = {
    val linesParsed = lines.map(parseSingleLine)
    if (excludeFailures) linesParsed.filter(i => !i.isFailure) else linesParsed
  }

  def parseSingleLine(input: String)(implicit parseContext: ParseContext) : TryWithErrors[OperationNode, AnnotationParseError, ParseContext] = {
    val errors = scala.collection.mutable.ListBuffer[AnnotationParseError]()

    def handleNameOrTag(expression: String) =
      Regexes.nameAndTagAssignment
      .extract(expression)("quoted")
      .map(_.replaceAll("^(\"|\\')|(\"|')$", "").trim)

    val result = for {
      (operation, expression) <- Try {
        val sl = Regexes.singleLine.extract(input)(_)
        (sl("operation").get, sl("expression").get)
      }
      operationNode <- Try {
        operation match {
          case "set" => {
            val assignments = Regexes.assignmentListParser(expression)
            assignments.foreach{
              case err: AnnotationParseError => errors.append(err)
              case _ =>
            }
            SetOperationNode(
              assignments
              .collect{case kvp: KeyValuePair => AssignmentNode(kvp.keyPath, kvp.value)})
          }
          case "source" => {
            val parsed = Regexes.source.extract(expression)(_)

            val projectName = {
              val pn = parsed("projectName")
              if (pn.contains(null)) None else pn
            }

            val objectId = parsed("objectId")
            val relationshipId = parsed("relationshipId").flatMap(i=> TransformationRef.fromString(i).toOption)
            val answers = Try(parsed("answers").map(Json.parse).map(_.as[JsObject])).toOption.flatten

            require(relationshipId.isDefined, "Relationship ID invalid")

            SourceOperationNode(projectName, objectId.get, relationshipId, answers)
          }
          case "name" => {
            val name = handleNameOrTag(expression).get
            NameOperationNode(name)
          }
          case "tag" => {
            val tag = handleNameOrTag(expression).get
            TagOperationNode(tag)
          }
        }
      }
    } yield operationNode

    TryWithErrors(result, errors.toVector, Some(parseContext))
  }

  object Regexes {
    //helpers
    def oneOf(seq: Seq[String]) = s"(${seq.mkString("|")})".r
    val w = "[ ]*".r //any single line whitespace
    val W = "[ ]+".r //required single line whitespace
    val tW = "(?<! )".r // trailing whitespace via neg lookbehind
    val any = ".+".r //any chars


    val dotNotation = "^(^(?!\\.)(?:[\\.]{0,1}[a-zA-Z0-9]+)+)".r("keyPath")

    //JSON Values
    def doubleQuotesString(inner: String) = s"""["]{1}($inner)["]{1}""".r("value")
    def singleQuotesString(inner: String) = s"""[']{1}($inner)[']{1}""".r("value")
    val boolean = """(true|false){1}""".r("value")
    val number = """([0-9]+)""".r("value")

    val nameAndTagAssignment = s"""=${W}([']{1}.*[']{1}|["]{1}.*["]{1})""".r("quoted")

    val assignmentListItem = {
      def e(c: String, c1: Option[String] = None, lazyTail: Boolean = false) = s"""[$c]{1}.*${if (lazyTail) "?" else ""}[${c1.getOrElse(c)}]{1}""".r

      val values = Seq(e("\"", lazyTail = true), e("'", lazyTail = true), e("\\[", Some("\\]")), e("{", Some("}")), boolean, number).mkString("|")
      s"""($dotNotation$W=$W($values))""".r("entire", "keyPath", "value")
    }

    val source = {
      val name = s"(${doubleQuotesString(namedObjectRegex.toString())}|${singleQuotesString(namedObjectRegex.toString())})"

      import com.opticdev.common.Regexes.packages

      val id = s"(${W}->${W}($packages)){0,1}([ ]+(\\{.*\\})){0,1}".r

      s"""=${W}($name$w:){0,1}$w$name$id""".r(
        "1", "2", "projectName", "4", "5", "objectId", "7", "8", "relationshipId", "10", "11", "12", "13", "14", "answers"
      )
    }

    val op = s"optic$w.$w${oneOf(availableOps)}".r("operation")
    val singleLine = s"$op$W($any)$tW".r("operation", "expression")

    def assignmentListParser(list: String): Vector[KVPair] = {
      var results = scala.collection.mutable.ListBuffer[KVPair]()
      var current = list
      var firstMatch: Option[Regex.Match] = null
      while(current.nonEmpty && {
        firstMatch = assignmentListItem.findFirstMatchIn(current)
        firstMatch.nonEmpty
      }) {
        val m = firstMatch.get

        val jsonValue = Try({
          val v = m.group("value")
          if (v.head == '\'' && v.last == '\'') { //make single quotes work
            val updated = v.zipWithIndex.map{
              case (c, i) => if (i == 0 || i == v.length - 1) '"' else c
            }
            Json.parse(updated.mkString)
          } else {
            Json.parse(v)
          }

        })
        results.append(
          if (jsonValue.isSuccess) {
           KeyValuePair(m.group("keyPath").split("\\."), jsonValue.get)}
           else KeyValuePairError(m.toString(), jsonValue.failed.get.getMessage))
        current = {
          val trimmed = current.substring(m.end)
          val i = trimmed.indexWhere(c => c.isLetter)
          if (i != -1) trimmed.substring(i) else ""
        }
      }

      if (results.isEmpty) {
        Vector(KeyValuePairError(list, "Could not parse assignment expression"))
      } else results.toVector
    }

  }
}