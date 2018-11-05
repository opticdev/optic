package com.opticdev.sdk.skills_sdk

case class OMRange(start: Int, end: Int) {
  def toRange = Range(start, end)
}

object OMRange {
  def apply(range: Range): OMRange = OMRange(range.start, range.end)
}
