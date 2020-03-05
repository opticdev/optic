package com.useoptic.diff.interactions

import com.useoptic.types.capture._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object ContentTypeHelpers {
  def contentType(request: Request): Option[String] = {
    request.body.contentType
  }

  def contentTypeOrNull(request: Request): String = {
    request.body.contentType.orNull
  }

  def contentType(response: Response): Option[String] = {
    response.body.contentType
  }

  def contentTypeOrNull(response: Response): String = {
    response.body.contentType.orNull
  }
}
