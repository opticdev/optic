package com.useoptic

import com.useoptic.contexts.requests.ContentTypes.supported
import com.useoptic.contexts.requests.Requests.ContentType

import scala.scalajs.js
import scala.scalajs.js.UndefOr
import scala.scalajs.js.annotation.JSExport

object ToJsTypes {
  private lazy val _contentTypeMap = supported.map(i => i.value -> i).toMap
  @JSExport
  def fromString(string: String): UndefOr[ContentType] = {
    import js.JSConverters._
    _contentTypeMap.get(string).orUndefined
  }

  @JSExport
  lazy val supportedContentTypesArray: js.Array[ContentType] = {
    import js.JSConverters._
    supported.toJSArray
  }

}
