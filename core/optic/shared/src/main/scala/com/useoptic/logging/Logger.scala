package com.useoptic.logging

import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

trait SimpleLogger {
  def log(x: Any): Any
}

@JSExportTopLevel("Logger")
@JSExportAll
object Logger {
  val printlnLogger: SimpleLogger = new SimpleLogger {
    override def log(x: Any): Any = println(x) //never delete this one, I'm allowed :)
  }
  val noopLogger: SimpleLogger = new SimpleLogger {
    override def log(x: Any): Any = {}
  }
  var logger = noopLogger

  def log(x: Any) = {
    logger.log(x)
  }

  def setLoggerImplementation(l: SimpleLogger) {
    logger = l
  }
}
