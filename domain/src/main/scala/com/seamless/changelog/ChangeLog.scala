package com.seamless.changelog

import com.seamless.changelog.Changelog.{AddedRequest}
import com.seamless.contexts.requests.Commands.RequestId

object Changelog {
  case class AddedRequest(path: String, method: String, requestId: RequestId)
}

case class Changelog(addedRequest: Vector[AddedRequest])
