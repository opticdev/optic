package com.opticdev.arrow

import better.files.File
import com.opticdev.common.PackageRef

package object changes {

  case class FileContents(file: File, contents: String)

  case class GearOption(name: Option[String], packageFull: String, id: String)

}
