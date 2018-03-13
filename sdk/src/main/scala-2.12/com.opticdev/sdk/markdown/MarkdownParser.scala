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

  private val pathToExecutable = "/usr/local/bin/node /usr/local/lib/node_modules/optic-markdown/lib/cli.js"

  def parseMarkdown(file: File) = Try[MDParseOutput] {
    //check the version eventually
    val version = pathToExecutable+ " --version" !!

    if (version.contains("not found")) throw new Error("optic-md is not installed. Run npm install optic-md -g")

    val result = pathToExecutable+ " " + file.pathAsString !!

    val parsedJson = Try(Json.parse(result))

    if (parsedJson.isFailure || !outputSchema.validate(parsedJson.get)) {
      throw new Error("Invalid output from markdown parser")
    } else
      MDParseOutput(parsedJson.get.as[JsObject])
  }

}
