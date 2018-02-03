package com.opticdev.arrow

import better.files.File

package object changes {

  case class FileContents(file: File, contents: String)
  case class ChangeResult(success: Boolean, fileContents: Option[FileContents])

}
