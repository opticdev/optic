package com.useoptic

import scala.scalajs.js

object DebuggingHelper {
  def withDebugger[A](f: => A): A = {
    try {
      f
    } catch {
      case a: Throwable => {
        println(a)
        scala.scalajs.js.special.debugger()
        throw new Error("Error within from JS")
      }
    }
  }
}
