package com.opticdev.common

import scala.util.Try

case class ParserRef(languageName: String, version: String = "latest") {
  def full = languageName+"@"+version
}

object ParserRef {
  def fromString(string: String): Try[ParserRef] = Try {

    val components = string.split("@")
    if (components.size > 2) {
      throw new Exception("Invalid Parser format")
    }

    val languageName = components.head
    val versionOption = components.lift(1)

    ParserRef(languageName, versionOption.getOrElse("latest"))
  }
}