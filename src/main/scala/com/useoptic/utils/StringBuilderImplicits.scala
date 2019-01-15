package com.useoptic.utils

object StringBuilderImplicits {
  implicit class StringBuilderWithRangeUpdate(stringBuilder: scala.collection.mutable.StringBuilder) {
    def updateRange(range: Range, contents: String) : StringBuilder = {

      if (range.end > stringBuilder.length + 1) {
        val extra = range.end - stringBuilder.length
        stringBuilder.append(List.fill(extra)("_").mkString)
      }

      def validRange(int: Int) = int >= 0 && int < stringBuilder.length + 1

      if (!validRange(range.start) || !validRange(range.end) || range.end < range.start) {
        throw new Error("Invalid range "+ range)
      }

      range.reverse.foreach(i=> {
        val charOption = contents.lift(range.indexOf(i))
        if (charOption.isDefined) {
          stringBuilder.update(i, charOption.get)
        } else {
          stringBuilder.deleteCharAt(i)
        }
      })

      if (contents.length > range.size) {
        val endOfContents = contents.substring(range.size)
        val remainingRange = Range(range.end, range.end + contents.length - range.size)

        remainingRange.foreach(i=> stringBuilder.insert(i, endOfContents(remainingRange.indexOf(i))))
      }

      stringBuilder
    }

    def insertAtIndex(insertAt: Int, newString: String ) : StringBuilder = {
      updateRange(Range(insertAt, insertAt), newString)
    }
  }
}
