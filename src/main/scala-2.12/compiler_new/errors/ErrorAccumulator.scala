package compiler_new.errors

import scala.collection.mutable.ListBuffer

class ErrorAccumulator {
  private val list = ListBuffer[Throwable]()
  def clear = list.clear()
  def add(error: Throwable): Unit = {
    if (error.isInstanceOf[CompilerException]) {
      list += error
    } else throw error //we don't want to hide internal errors anymore.
  }

  def printAll = {
    list.foreach(i=> println(i))
  }
}
