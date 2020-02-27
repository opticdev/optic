package com.useoptic.diff.interactions

import com.useoptic.types.capture._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object ContentTypeHelpers {
  def contentType(request: Request): Option[String] = {
    request.headers.find(x => x.name == "content-type").map(_.value)
  }

  def contentTypeOrNull(request: Request): String = {
    request.headers.find(x => x.name == "content-type").map(_.value).orNull
  }

  def contentType(response: Response): Option[String] = {
    response.headers.find(x => x.name == "content-type").map(_.value)
  }

  def contentTypeOrNull(response: Response): String = {
    response.headers.find(x => x.name == "content-type").map(_.value).orNull
  }
}
