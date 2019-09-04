package com.seamless

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobalScope
import scala.util.Try

@js.native
@JSGlobalScope
object AnalyticsJsStub extends js.Object {
  def track(text: String, data: js.Dictionary[String]): js.Any = js.native
}

object Analytics {
  def track(text: String, data: Map[String, String] = Map.empty) = {
    import js.JSConverters._
    Try {
      AnalyticsJsStub.track(text, data.toJSDictionary)
    }
  }
}
