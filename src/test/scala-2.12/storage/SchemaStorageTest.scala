package storage

import com.opticdev.core.sdk.descriptions.{Schema, SchemaId}
import com.opticdev.core.storage.schema.SchemaStorage
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}

class SchemaStorageTest extends FunSpec {

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

  describe("Schema Storage") {
    val schema = Schema.fromJson(validTestSchema)

    val asSchemaId = schema.asSchemaId

    describe("on disk") {
      val outputFile = SchemaStorage.writeToStorage(schema)

      it("can save a schema") {
        assert(outputFile.exists)
      }

      it("can load that schema") {
        val loaded = SchemaStorage.loadFromStorage(asSchemaId)
        assert(loaded.get == schema)
      }

      it("return None if schema does not exist") {
        val loaded = SchemaStorage.loadFromStorage(SchemaId("fake-schema^0.1"))
        assert(loaded.isEmpty)
      }

      it("return None if schema is corrupt") {
        outputFile.write("FAKE STUFF. INVALID!!! :(")
        val loaded = SchemaStorage.loadFromStorage(SchemaId("fake-schema^0.1"))
        assert(loaded.isEmpty)
      }

    }


  }

}
