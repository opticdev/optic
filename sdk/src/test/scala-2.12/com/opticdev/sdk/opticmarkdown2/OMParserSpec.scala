package com.opticdev.sdk.opticmarkdown2

import com.opticdev.common.{PackageRef, SchemaRef}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}

class OMParserSpec extends FunSpec {

  val testPackageRef = PackageRef("test:abcdef", "0.1.1")

  describe("Schema Parsing") {

    it("can parse a valid schema") {
      val result = OMParser.parseSchema(JsObject.empty)(SchemaRef(Some(testPackageRef), "schema"))
      assert(result.isSuccess)
      assert(result.get.definition == JsObject.empty)
      assert(result.get.schemaRef.full == "test:abcdef@0.1.1/schema")
    }

    it("will fail if schema has an invalid format") {
      val result = OMParser.parseSchema(Json.parse("""{"type": "bubblegum"}""").as[JsObject])(SchemaRef(Some(testPackageRef), "schema"))
      assert(result.isFailure)
    }

    it("can be marked as internal") {
      val result = OMParser.parseSchema(JsObject.empty)(SchemaRef(Some(testPackageRef), "schema"), internal = true)
      assert(result.get.internal)
    }

  }

  describe("Lens parsing") {
    it("can parse a valid lens with a ref to an internal schema") {
      val lensJson = Json.parse("""{
                   |	"name": "exampleName",
                   |	"id": "exampleid",
                   |	"snippet": {
                   |		"block": "code + code1",
                   |		"language": "es7"
                   |	},
                   |	"value": {},
                   |	"variables": {},
                   |	"containers": {},
                   |	"schema": "internalSchema",
                   |	"initialValue": {"test": true}
                   |}""".stripMargin).as[JsObject]

      val parsedLens = OMParser.parseLens(lensJson)(testPackageRef)

      assert(parsedLens.isSuccess)
      assert(parsedLens.get.schema.left.get.full == "test:abcdef@0.1.1/internalSchema")
    }

    it("can parse a valid lens with its own internal schema") {
      val lensJson = Json.parse("""{
                                  |	"name": "exampleName",
                                  |	"id": "exampleid",
                                  |	"snippet": {
                                  |		"block": "code + code1",
                                  |		"language": "es7"
                                  |	},
                                  |	"value": {},
                                  |	"variables": {},
                                  |	"containers": {},
                                  |	"schema": {},
                                  |	"initialValue": {"test": true}
                                  |}""".stripMargin).as[JsObject]

      val parsedLens = OMParser.parseLens(lensJson)(testPackageRef)

      assert(parsedLens.isSuccess)
      assert(parsedLens.get.schema.right.get.definition == JsObject.empty)
      assert(parsedLens.get.schema.right.get.schemaRef.full == "test:abcdef@0.1.1/exampleid____schema")
      assert(parsedLens.get.schema.right.get.internal)
    }

    it("can parse a valid lens with an external schema") {
      val lensJson = Json.parse("""{
                                  |	"name": "exampleName",
                                  |	"id": "exampleid",
                                  |	"snippet": {
                                  |		"block": "code + code1",
                                  |		"language": "es7"
                                  |	},
                                  |	"value": {},
                                  |	"variables": {},
                                  |	"containers": {},
                                  |	"schema": "optic:otherPackage@1.1.1/schema",
                                  |	"initialValue": {"test": true}
                                  |}""".stripMargin).as[JsObject]

      val parsedLens = OMParser.parseLens(lensJson)(testPackageRef)

      assert(parsedLens.isSuccess)
      assert(parsedLens.get.schema.left.get.full == "optic:otherPackage@1.1.1/schema")
    }

  }

}
