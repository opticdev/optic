package com.opticdev.arrow

import better.files.File

package object changes {

  case class FileContents(file: File, contents: String)

}
