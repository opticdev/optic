package com.opticdev.arrow.changes.evaluation

class ClipboardBuffer {

  private val clipboardBuffer = new StringBuilder



  def append(string: String): Unit = {
    if (clipboardBuffer.nonEmpty) {
      clipboardBuffer.append("\n\n")
    }
    clipboardBuffer.append(string)
  }

  def nonEmpty = contents.nonEmpty

  def contents = clipboardBuffer.toString()

}
