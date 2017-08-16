package compiler_new.errors

import scala.collection.mutable.ListBuffer

class ErrorAccumulator {
  private val list = ListBuffer[CompilerError]()
  def clear = list.clear()
  def add(compilerError: CompilerError): Unit = list += compilerError
}
