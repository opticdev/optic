package com.opticdev.core.sourcegear.annotations

import better.files.File
import play.api.libs.json.{JsError, JsObject, JsValue}

import scala.util.Try

package object dsl {

  case class ParseContext(file: File, range: Range)

  val availableOps = Seq("set", "name", "source", "tag")


  sealed trait AnnotationParseError
  case class OpticAnnotationParseException(err: String) extends Exception {
    override def getMessage: String = "OpticAnnotationParseError: "+err
  }

  sealed trait KVPair

  case class KeyValuePair(keyPath: Seq[String], value: JsValue) extends KVPair
  case class KeyValuePairError(raw: String, jsonError: String) extends KVPair with AnnotationParseError
}
