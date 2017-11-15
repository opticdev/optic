package com.opticdev.core.io

object FileUtils {
//  implicit class FileNodeMethods(val fn: BaseFileNode) {
//
//    def getString(range: (Int, Int) ) : String = fn.contents.substring(range._1, range._2)
//    def replaceRange(range: (Int, Int), newString: String ) : String = StringUtils.replaceRange(fn.contents, range, newString)
//
//  }
}

object StringUtils {

  def replaceRange(contents: String, range: (Int, Int), newString: String ) : String = {
    val finalString = contents.substring(0, range._1) +
      newString +
      contents.substring(range._2, contents.length)
    finalString
  }

}