package com.seamless.contexts.base

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

@JSExportAll
@JSExportDescendentClasses
trait BaseCommandContext {
  val clientId: String
  val clientSessionId: String
  val clientCommandBatchId: String
}
