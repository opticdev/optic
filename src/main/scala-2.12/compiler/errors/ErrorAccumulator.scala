package compiler.errors

import scala.collection.mutable.ListBuffer
import scala.util.{Failure, Try}

class ErrorAccumulator {
  private val list = ListBuffer[Throwable]()
  def clear = list.clear()
  def add(error: Throwable): Unit = {
    if (error.isInstanceOf[CompilerException]) {
      list += error
    } else throw error //we don't want to hide internal errors anymore.
  }

  def handleFailure(failure: Try[Throwable]) = if (failure.isSuccess) add(failure.get)

  def printAll = {
    list.foreach(i=> println(i))
  }
}
