package com.opticdev.sdk.markdown

import better.files.File
import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json.{JsArray, JsObject, Json}

import scala.sys.process._
import scala.util.Try

object MarkdownParser {

  private val outputSchema = Schema(null, Json.parse(
    """
      |{ "type": "object", "title": "MD Parse Output", "properties": {
      |   "description": { "type": "object" },
      |   "errors": { "type": "array" }
      |} }
    """.stripMargin).as[JsObject])

  case class MDParseOutput(jsObject: JsObject) {
    def description = (jsObject \ "description").getOrElse(JsObject.empty).as[JsObject]

    def lenses = (jsObject \ "description" \ "lenses").getOrElse(JsArray.empty).as[JsArray]
    def schemas = (jsObject \ "description" \ "schemas").getOrElse(JsArray.empty).as[JsArray]
    def dependencies = (jsObject \ "description" \ "dependencies").getOrElse(JsArray.empty).as[JsArray]


    def errors = (jsObject \ "errors").getOrElse(JsArray.empty).as[JsArray]
    def noErrors = errors.value.isEmpty
  }


  def parseMarkdown(file: File) : Try[MDParseOutput] = {
    OpticMarkdownInstaller.getOrInstall
      .map(i=> {
        val result = i.parseFile(file.pathAsString)
        if (!outputSchema.validate(result)) {
          throw new Error("Invalid output from markdown parser")
        } else
          MDParseOutput(result)
      })
  }

}
