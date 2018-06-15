package com.opticdev.core.compiler.validation

import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.compiler.stages.SchemaValidation
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}
import com.opticdev.sdk.descriptions.{Schema}

class SchemaValidationSpec extends FunSpec {

  val basicSchema = Schema(SchemaRef(Some(PackageRef("test")), "test"), Json.parse("""{
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

  val nestedRequired = Schema(SchemaRef(Some(PackageRef("test")), "test"), Json.parse("""{
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
  
  describe("gets required paths") {
    it("works on a flat schema") {
      val paths = SchemaValidation.requiredPaths(basicSchema)
      assert(paths == Set(Seq("firstName"), Seq("lastName")))
    }

    it("works on a nested schema") {
      val paths = SchemaValidation.requiredPaths(nestedRequired)
      assert(paths == Set(Seq("foo"), Seq("bar"), Seq("bar", "me")))
    }

  }

  describe("can get an arbitrary path") {

    it("works for flat properties") {
      val pathOption = SchemaValidation.getPath(Seq("firstName"), basicSchema)
      assert(pathOption.isDefined)
      assert(pathOption.get.value.get("type").get.as[JsString].value == "string")
    }

    it("fails to find missing flat properties") {
      val pathOption = SchemaValidation.getPath(Seq("othername"), basicSchema)
      assert(pathOption.isEmpty)
    }

    it("works for nested properties") {
      val pathOption = SchemaValidation.getPath(Seq("bar", "me"), nestedRequired)
      assert(pathOption.isDefined)
      assert(pathOption.get.value.get("type").get.as[JsString].value == "string")
    }

    it("fails to find missing nested properties") {
      val pathOption = SchemaValidation.getPath(Seq("bar","me","not_here"), nestedRequired)
      assert(pathOption.isEmpty)
    }

  }
}
