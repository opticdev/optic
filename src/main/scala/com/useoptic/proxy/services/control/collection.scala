package com.useoptic.proxy.services.control

import play.api.libs.json.{Json}

package object collection {
  object Protocol {
    case class StartCollection(project_name: String, forwardTo: Option[String])
    implicit val startCollectionFormats = Json.format[StartCollection]
  }
}
