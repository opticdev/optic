package com.opticdev.common.utils

import scala.util.Try

object RangeToLine {
  implicit class CharRangeToLineRange(range: Range) {
    def toLineRange(fileContents: String): Range = {
      val fullSubString = fileContents.substring(range.start, range.end)

      val startLine = fileContents.substring(0, range.start).linesWithSeparators.length
      val endLine = startLine + fileContents.substring(range.start, range.end).linesWithSeparators.length - 1
      Range(startLine, endLine)
    }
  }
}
