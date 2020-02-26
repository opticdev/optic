package com.useoptic.diff.interactions

case class InteractionTrail(path: Seq[InteractionTrailPathComponent]) {
  def statusCode(): Int = {
    path.find {
      case r: ResponseStatusCode => return r.statusCode
      case r: ResponseBody => return r.statusCode
      case _ => false
    }
    throw new Error("expected to find a response in trail")
  }

  def requestContentType(): String = {
    path.find {
      case r: RequestBody => return r.contentType
      case _ => false
    }
    throw new Error("Expected to find a request body context in trail")
  }

  def responseContentType(): String = {
    path.find {
      case r: ResponseBody => return r.contentType
      case _ => false
    }
    throw new Error("Expected to find a response body context in trail")
  }
}

sealed trait InteractionTrailPathComponent

case class Url(url: String) extends InteractionTrailPathComponent

case class Method(method: String) extends InteractionTrailPathComponent

case class ResponseStatusCode(statusCode: Int) extends InteractionTrailPathComponent

case class QueryString(queryString: String) extends InteractionTrailPathComponent

case class RequestHeaders(headerName: String) extends InteractionTrailPathComponent

case class RequestBody(contentType: String) extends InteractionTrailPathComponent

case class ResponseHeaders(headerName: String) extends InteractionTrailPathComponent

case class ResponseBody(contentType: String, statusCode: Int) extends InteractionTrailPathComponent
