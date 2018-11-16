package com.opticdev.common.utils

object RangeToLine {
  implicit class CharRangeToLineRange(range: Range) {
    def toLineRange(fileContents: String): Range = {
      val startLine = fileContents.substring(0, range.start).lines.length
      val endLine = startLine + fileContents.substring(range.start, range.end).lines.length - (if (fileContents.charAt(range.end) == '\n') 0 else 1)

      Range(startLine, endLine)
    }
  }
}
