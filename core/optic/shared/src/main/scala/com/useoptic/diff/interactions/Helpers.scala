package com.useoptic.diff.interactions

import com.useoptic.types.capture._

object Helpers {
  def contentType(request: Request): Option[Header] = {
    request.headers.find(x => x.name == "content-type")
  }

  def contentType(response: Response): Option[Header] = {
    response.headers.find(x => x.name == "content-type")
  }
}
