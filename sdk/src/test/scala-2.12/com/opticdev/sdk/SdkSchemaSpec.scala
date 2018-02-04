package com.opticdev.sdk

import com.github.fge.jsonschema.main.JsonSchema
import com.opticdev.common.PackageRef
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}

class SdkSchemaSpec extends FunSpec {

  val validTestSchema = Json.parse("""{
        "title": "import",
        "version": "1.0.0",
        "slug": "js-import",
        "type": "object",
        "required": [
          "pathTo",
          "definedAs"
        ],
        "properties": {
          "pathTo": {
            "type": "string"
          },
          "definedAs": {
            "type": "string"
          }
        },
        "exported": true
      }""").as[JsObject]


  val validAltSchema = Json.parse("""{
        "title": "importOther",
        "version": "1.0.0",
        "slug": "js-import",
        "type": "object",
        "required": [
          "pathTo",
          "definedAs"
        ],
        "properties": {
          "otherPathTo": {
            "type": "string"
          },
          "otherDefinedAs": {
            "type": "string"
          }
        },
        "exported": true
      }""").as[JsObject]

  val invalidTestSchema = Json.parse("""{
        "title": "import",
        "type": "not-real"
      }""").as[JsObject]

    describe("Validator") {
      it("on a valid schema") {
        assert(Schema.schemaObjectFromJson(validTestSchema).isInstanceOf[JsonSchema])
      }

      it("on an invalid schema") {
        assertThrows[Error] {
          Schema.schemaObjectFromJson(invalidTestSchema)
        }
      }
    }


    describe("Constructor") {

      it("on a valid schema") {
        val schema = Schema(SchemaRef(PackageRef("test"), "import"), validTestSchema)
        assert(schema.name === "import")
      }

      it("on an invalid schema") {
        assertThrows[Error] {
          Schema(SchemaRef(PackageRef("test"), "import"), invalidTestSchema)
        }
      }

    }

    describe("Instance validator") {

      val schema = Schema(SchemaRef(PackageRef("test"), "import"), validTestSchema)

      it("on a valid instance") {
        assert(schema.validate(JsObject(Seq("pathTo"-> JsString("Hello"), "definedAs"-> JsString("World")))))
      }

      it("on an invalid instance") {
        assert(!schema.validate(JsObject(Seq("definedAs"-> JsString("World")))))
      }

    }

    describe("equality method says") {
      it("equal schemas as equal") {
        assert(Schema(SchemaRef(PackageRef("test"), "import"), validTestSchema) == Schema(SchemaRef(PackageRef("test"), "import"), validTestSchema))
      }

      it("equal schemas with different json refs as equal") {
        assert(Schema(SchemaRef(PackageRef("test"), "import"), validTestSchema) == Schema(SchemaRef(PackageRef("test"), "import"), Json.parse("""{
        "title": "import",
        "version": "1.0.0",
        "slug": "js-import",
        "type": "object",
        "required": [
          "pathTo",
          "definedAs"
        ],
        "properties": {
          "pathTo": {
            "type": "string"
          },
          "definedAs": {
            "type": "string"
          }
        },
        "exported": true
      }""").as[JsObject]))
      }

      it("unequal schemas are different") {
        assert(Schema(SchemaRef(PackageRef("test"), "import"), validTestSchema) != Schema(SchemaRef(PackageRef("test"), "import"), validAltSchema))
      }
    }

    it("Works with fromJson method") {
      assert(Schema.fromJson(validTestSchema).isInstanceOf[Schema])
    }

  describe("from string") {
    it("works for valid input") {
      {
        val ref = SchemaRef.fromString("optic:rest/parameter").get
        assert(ref.packageRef.full == "optic:rest@latest")
        assert(ref.id == "parameter")
      }
      {
        val ref = SchemaRef.fromString("optic:rest@1.0.0/parameter").get
        assert(ref.packageRef.full == "optic:rest@1.0.0")
        assert(ref.id == "parameter")
      }
    }

    it("fails when input is invalid") {
      assert(SchemaRef.fromString("").isFailure)
      assert(SchemaRef.fromString("/").isFailure)
    }

    it("works for self lookups") {
      val ref = SchemaRef.fromString("parameter", PackageRef.fromString( "optic:rest@1.0.0" ).get).get
      assert(ref.packageRef.full == "optic:rest@1.0.0")
      assert(ref.id == "parameter")
    }

  }

  it("can serialize and deserialize in json") {
    val ref = SchemaRef.fromString("optic:rest@1.0.0/parameter").get
    import SchemaRef.schemaRefFormats
    assert(Json.fromJson[SchemaRef](Json.toJson[SchemaRef](ref)).get == ref)
  }

}
