package com.useoptic.common.spec_types

import play.api.libs.json.Json

case class APIDescription(description: Option[String],
                          version: Option[String],
                          servers: Option[Servers])

case class Servers(production: Option[String], development: Option[String], staging: Option[String], other: Option[Vector[String]])

object APIDescription {
  implicit val serversFormat = Json.format[Servers]
  implicit val apiDescriptionFormats = Json.format[APIDescription]

  def empty = APIDescription(None, None, None)
}
