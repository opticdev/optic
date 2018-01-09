package com.opticdev.sdk

import better.files.File
import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json.{JsArray, JsObject, Json}

import scala.util.Try
import sys.process._

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

  def parseMarkdown(file: File) = Try[MDParseOutput] {
    //check the version eventually
    val version = "optic-md --version" !!

    if (version.contains("not found")) throw new Error("optic-md is not installed. Run npm install optic-md -g")

    val result = "optic-md " + file.pathAsString !!

    val parsedJson = Try(Json.parse(result))

    if (parsedJson.isFailure || !outputSchema.validate(parsedJson.get)) {
      throw new Error("Invalid output from markdown parser")
    } else
      MDParseOutput(parsedJson.get.as[JsObject])
  }

}
