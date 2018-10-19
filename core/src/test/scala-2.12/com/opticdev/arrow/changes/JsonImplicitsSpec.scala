package com.opticdev.arrow.changes

import better.files.File
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}
import com.opticdev.arrow.changes.location.{AsChildOf, InsertLocation, RawPosition}
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

class JsonImplicitsSpec extends FunSpec {

  describe("Location format") {

    it("Raw Position toJSON & back again") {
      import JsonImplicits.insertLocationFormat
      val o = RawPosition(File("path/to/File"), 621)
      val json = Json.toJson[InsertLocation](o)
      assert(Json.fromJson[InsertLocation](json).get == o)
    }

    it("As child of toJSON & back again") {
      import JsonImplicits.insertLocationFormat
      val o = AsChildOf(File("path/to/File"), 621)
      val json = Json.toJson[InsertLocation](o)
      assert(Json.fromJson[InsertLocation](json).get == o)
    }

  }

  describe("Optic Change format") {
    import JsonImplicits.opticChangeFormat

    it("Raw Insert toJSON & back again") {
      val o = RawInsert("Value", RawPosition(File("a/b/c"), 145))
      val json = Json.toJson[OpticChange](o)
      assert(Json.fromJson[OpticChange](json).get == o)
    }

  }

}
