package sdk

import com.github.fge.jsonschema.main.JsonSchema
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}
import com.opticdev.core.sdk.descriptions.Schema

class SdkSchemaTest extends FunSpec {

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

  describe("Sdk Schema") {

    describe("Validator") {
      it("on a valid schema") {
        assert(Schema.schemaObjectfromJson(validTestSchema).isInstanceOf[JsonSchema])
      }

      it("on an invalid schema") {
        assertThrows[Error] {
          Schema.schemaObjectfromJson(invalidTestSchema)
        }
      }
    }


    describe("Constructor") {

      it("on a valid schema") {
        val schema = Schema(validTestSchema)
        assert(schema.name === "import")
        assert(schema.version === "1.0.0")
        assert(schema.slug === "js-import")
      }

      it("on an invalid schema") {
        assertThrows[Error] {
          Schema(invalidTestSchema)
        }
      }

    }

    describe("Instance validator") {

      val schema = Schema(validTestSchema)

      it("on a valid instance") {
        assert(schema.validate(JsObject(Seq("pathTo"-> JsString("Hello"), "definedAs"-> JsString("World")))))
      }

      it("on an invalid instance") {
        assert(!schema.validate(JsObject(Seq("definedAs"-> JsString("World")))))
      }

    }

    describe("equality method says") {
      it("equal schemas as equal") {
        assert(Schema(validTestSchema) == Schema(validTestSchema))
      }

      it("equal schemas with different json refs as equal") {
        assert(Schema(validTestSchema) == Schema(Json.parse("""{
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
        assert(Schema(validTestSchema) != Schema(validAltSchema))
      }
    }

    it("Works with fromJson method") {
      assert(Schema.fromJson(validTestSchema).isInstanceOf[Schema])
    }

  }

}
