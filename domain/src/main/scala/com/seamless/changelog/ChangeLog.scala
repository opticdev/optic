package com.seamless.changelog

import com.seamless.changelog.Changelog.{AddedRequest}
import com.seamless.contexts.requests.Commands.RequestId

object Changelog {
  sealed trait Change
  case class AddedRequest(path: String, method: String, requestId: RequestId) extends Change
  case class PlaceHolder(thing: String) extends Change
}

case class Changelog(addedRequest: Vector[AddedRequest])
