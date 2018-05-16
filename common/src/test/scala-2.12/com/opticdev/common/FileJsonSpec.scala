package com.opticdev.common

import better.files.File
import org.scalatest.FunSpec
import play.api.libs.json.Json

class FileJsonSpec extends FunSpec {

  it("Files toJSON & back again") {
    import com.opticdev.common.fileFormat
    val file = File("path/to/file")
    val json = Json.toJson[File](File("path/to/file"))

    assert(Json.fromJson[File](json).get == file)
  }

}
