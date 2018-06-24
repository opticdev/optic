package com.opticdev.sdk.opticmarkdown2

case class OMRange(start: Int, end: Int) {
  def toRange = Range(start, end)
}

object OMRange {
  def apply(range: Range): OMRange = OMRange(range.start, range.end)
}
