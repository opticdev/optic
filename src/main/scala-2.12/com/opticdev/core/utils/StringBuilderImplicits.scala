package com.opticdev.core.utils

object StringBuilderImplicits {
  implicit class StringBuilderWithRangeUpdate(stringBuilder: scala.collection.mutable.StringBuilder) {
    def updateRange(range: Range, contents: String) = {
      range.reverse.foreach(i=> {
        val charOption = contents.lift(i)
        if (charOption.isDefined) {
          stringBuilder.update(i, charOption.get)
        } else {
          stringBuilder.deleteCharAt(i)
        }
      })

      if (contents.length > range.size) {
        val endOfContents = contents.substring(range.size)
        //a few items are left to insert
        Range(range.end, range.end + contents.length - range.size).foreach(i=>
          stringBuilder.insert(i, endOfContents(i - range.size))
        )
      }
    }
  }
}
