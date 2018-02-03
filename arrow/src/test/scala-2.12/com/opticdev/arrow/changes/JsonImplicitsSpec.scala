package com.opticdev.arrow.changes

import better.files.File
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}
import com.opticdev.arrow.changes.location.{AsChildOf, RawPosition}
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef

class JsonImplicitsSpec extends FunSpec {

  it("Files toJSON & back again") {
    import JsonImplicits.fileFormat
    val file = File("path/to/file")
    val json = Json.toJson[File](File("path/to/file"))

    assert(Json.fromJson[File](json).get == file)

  }

  describe("Location format") {

    it("Raw Position toJSON & back again") {
      import JsonImplicits.rawPosition
      val o = RawPosition(File("path/to/File"), 621)
      val json = Json.toJson[RawPosition](o)
      assert(Json.fromJson[RawPosition](json).get == o)
    }

    it("As child of toJSON & back again") {
      import JsonImplicits.asChildOfFormat
      val o = AsChildOf(File("path/to/File"), 621)
      val json = Json.toJson[AsChildOf](o)
      assert(Json.fromJson[AsChildOf](json).get == o)
    }

  }

  describe("Optic Change format") {
    import JsonImplicits.opticChangeFormat

    it("Insert model toJSON & back again") {
      val o = InsertModel(SchemaRef(PackageRef("optic:test"), "name"),
        JsObject.empty, RawPosition(File("path/To/file"), 12))

      val json = Json.toJson[OpticChange](o)
      assert(Json.fromJson[OpticChange](json).get == o)
    }

    it("Raw Insert toJSON & back again") {
      val o = RawInsert("Value", RawPosition(File("a/b/c"), 145))
      val json = Json.toJson[OpticChange](o)
      assert(Json.fromJson[OpticChange](json).get == o)
    }

  }

}
