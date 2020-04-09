package com.useoptic

import com.useoptic.logging.SimpleLogger

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class LoggerWrapper(logger: js.Function1[Any, Any]) extends SimpleLogger {
  def log(x: Any) = {
    logger(x.toString())
  }
}
