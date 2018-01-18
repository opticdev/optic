package com.opticdev.core.utils


object StringUtils {

  def replaceRange(contents: String, range: (Int, Int), newString: String ) : String = {
    val finalString = contents.substring(0, range._1) +
      newString +
      contents.substring(range._2, contents.length)
    finalString
  }

//  /* !!Important note on range mutable code. Should only be used for formatting and other non structural characters
//    Handles 3 cases:
//      Entire node is after edited range
//      Entire node is before edited range
//      Entire node encloses edited range
//
//    Known unhandled cases -- throws
//      node starts in the middle of edited range
//      node ends in the middle of edited range
//      Entire node is enclosed by edited range
//   */
//  def replaceRangeAndUpdateRanges(contents: String, editRange: Range, newString: String, vector: Vector[RangeMutable]) : (String, Vector[RangeMutable]) = {
//    val finalString = contents.substring(0, editRange.start) +
//      newString +
//      contents.substring(editRange.end, contents.length)
//
//    val difference = newString.length - editRange.length
//
//    val newRanges = vector.map(rangedObject=> {
//      val oRange = rangedObject.range
//      val oStart = oRange.start
//      val oEnd = oRange.end
//
//      val newRange = {
//        //entirely after
//        if (oRange.start > editRange.end) {
//          Range(oStart + difference, oEnd + difference)
//        //entirely before
//        } else if (oEnd < editRange.start) {
//          oRange
//        //enclosing edit range
//        } else if ( (oRange intersect editRange).size == editRange.size) {
//          Range(oStart, oEnd + difference)
//        } else {
//          throw new Error("Unsupported Edit Range. Updating sibling ranges not possible")
//        }
//
//      }
//
//      rangedObject.withRange(newRange)
//
//    })
//
//    (finalString, newRanges)
//  }

}