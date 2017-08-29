package compiler_new.errors

import scala.collection.mutable.ListBuffer

class ErrorAccumulator {
  private val list = ListBuffer[Throwable]()
  def clear = list.clear()
  def add(compilerError: Throwable): Unit = list += compilerError

  def printAll = {
    list.foreach(i=> println(i))
  }
}
