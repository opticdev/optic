package com.opticdev.sdk.descriptions

import com.opticdev.parsers.LanguageId
import play.api.libs.json.{JsObject, JsString, JsValue}
import play.api.libs.json._

object Snippet extends Description[Snippet] {

  implicit val snippetReads: Reads[Snippet] = Json.reads[Snippet]

  override def fromJson(jsValue: JsValue): Snippet = {

    val snippet: JsResult[Snippet] = Json.fromJson[Snippet](jsValue)

    if (snippet.isSuccess) {
      snippet.get
    } else {
      throw new Error("Snippet Parsing Failed "+snippet)
    }

  }
}

//@todo remove raw lang and version and replace with languageId
case class Snippet(language: String, version: Option[String], block: String) {
  def languageId = LanguageId(language, version)
}
