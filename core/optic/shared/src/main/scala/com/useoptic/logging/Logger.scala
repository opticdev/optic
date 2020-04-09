package com.useoptic.logging

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

trait SimpleLogger {
  def log(x: Any): Any
}
@JSExport
@JSExportAll
object Logger {
  var logger: SimpleLogger = new SimpleLogger {
    override def log(x: Any): Any = println(x)
  }

  def log(x: Any) = {
    logger.log(x)
  }

  def setLoggerImplementation(l: SimpleLogger) {
    logger = l
  }
}
