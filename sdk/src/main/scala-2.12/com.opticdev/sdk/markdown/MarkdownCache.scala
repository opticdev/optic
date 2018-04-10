package com.opticdev.sdk.markdown

import java.nio.charset.StandardCharsets

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.utils.FileCrypto
import com.opticdev.sdk.markdown.MarkdownParser.MDParseOutput
import play.api.libs.json.{JsObject, Json}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

object MarkdownCache {

  def cacheMarkdown(file: File, jsObject: JsObject) : Future[File] = cacheMarkdown(file.contentAsString, jsObject)

  def cacheMarkdown(contents: String, jsObject: JsObject) = Future[File] {
    val hash = FileCrypto.sha256Hash(contents).toLowerCase
    jsObject.toString()

    val targetFile = DataDirectory.markdownCache / hash

    targetFile.createIfNotExists()

    targetFile.writeByteArray(jsObject.toString().getBytes)
  }

  def lookup(file: File): Option[MDParseOutput] = lookup(file.sha256.toLowerCase)
  def lookup(hash: String) : Option[MDParseOutput] = Try {
    val cacheFile = DataDirectory.markdownCache / hash
    val str = new String(cacheFile.byteArray, StandardCharsets.UTF_8)
    MDParseOutput(Json.parse(str).as[JsObject])
  }.toOption

  def clear = {
    DataDirectory.markdownCache.delete(true)
    DataDirectory.markdownCache.createIfNotExists(true, true)
  }
}
