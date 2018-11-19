package com.opticdev.common.utils

import scala.util.Try

object RangeToLine {
  implicit class CharRangeToLineRange(range: Range) {
    def toLineRange(fileContents: String): Range = {
      val fullSubString = fileContents.substring(range.start, range.end)

      val startLine = {
        val beforeContents = fileContents.substring(0, range.start)

        val lastLineBreak = beforeContents.lastIndexOf("\n")
        val startOffset = if (lastLineBreak == -1 || lastLineBreak + 1 == range.start) 1 else 0

        beforeContents.linesWithSeparators.length + startOffset
      }

      val endLine = startLine + fileContents.substring(range.start, range.end).linesWithSeparators.length - 1
      Range(startLine, endLine)
    }
  }
}
