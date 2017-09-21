package compiler.validation

import com.opticdev.core.compiler.stages.SchemaValidation
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}
import com.opticdev.core.sdk.descriptions.Schema

class SchemaValidationTest extends FunSpec {

  val basicSchema = Schema(Json.parse("""{
                            "title": "Test",
                            "version": "test",
                            "slug": "test",
                            "type": "object",
                            "properties": {
                                "firstName": {
                                    "type": "string"
                                },
                                "lastName": {
                                    "type": "string"
                                },
                                "age": {
                                    "description": "Age in years",
                                    "type": "integer",
                                    "minimum": 0
                                }
                            },
                            "required": ["firstName", "lastName"]
                        }""").as[JsObject])

  val nestedRequired = Schema(Json.parse("""{
                             "title": "Test",
                             "type": "object",
                             "version": "test",
                             "slug": "test",
                             "required": [
                               "foo",
                               "bar"
                             ],
                             "properties": {
                               "foo": {
                                 "type": "number"
                               },
                               "bar": {
                                 "type": "object",
                                 "required": [
                                   "me"
                                 ],
                                 "properties": {
                                   "me": {
                                     "type": "string"
                                   }
                                 }
                               }
                             }
                           }""").as[JsObject])


  describe("Schema Validation") {

    describe("gets required paths") {
      it("works on a flat schema") {
        val paths = SchemaValidation.requiredPaths(basicSchema)
        assert(paths == Set("firstName", "lastName"))
      }

      it("works on a nested schema") {
        val paths = SchemaValidation.requiredPaths(nestedRequired)
        assert(paths == Set("foo", "bar", "bar.me"))
      }

    }

    describe("can get an arbitrary path") {

      it("works for flat properties") {
        val pathOption = SchemaValidation.getPath("firstName", basicSchema)
        assert(pathOption.isDefined)
        assert(pathOption.get.value.get("type").get.as[JsString].value == "string")
      }

      it("fails to find missing flat properties") {
        val pathOption = SchemaValidation.getPath("othername", basicSchema)
        assert(pathOption.isEmpty)
      }

      it("works for nested properties") {
        val pathOption = SchemaValidation.getPath("bar.me", nestedRequired)
        assert(pathOption.isDefined)
        assert(pathOption.get.value.get("type").get.as[JsString].value == "string")
      }

      it("fails to find missing nested properties") {
        val pathOption = SchemaValidation.getPath("bar.me.not_here", nestedRequired)
        assert(pathOption.isEmpty)
      }

    }

  }
}
