package com.useoptic

import com.useoptic.logging.Logger

object DebuggingHelper {
  def withDebugger[A](f: => A): A = {
    try {
      f
    } catch {
      case a: Throwable => {
        Logger.log(a)
        scala.scalajs.js.special.debugger()
        throw new Error("Error within from JS")
      }
    }
  }
}
