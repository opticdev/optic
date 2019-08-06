package com.seamless.oas

import play.api.libs.json.{JsObject, JsPath, JsValue, Json}

import scala.util.Try

object JSONReference {

  def toPath(string: String): Vector[String] = {

    val split = string.split("/")
      .filterNot(_.isEmpty)
      .toVector

    split.slice(1, split.length)
  }

  def walk(string: String, root: JsValue): Option[JsValue] = {
    val path = toPath(string)
    walk(path, root)
  }

  def walk(path: Vector[String], root: JsValue): Option[JsValue] = Try {
    path.foldLeft(root) { case (path, key) => (path \ key).get}
  }.toOption

}
