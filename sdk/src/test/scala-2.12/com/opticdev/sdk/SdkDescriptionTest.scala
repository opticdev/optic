package com.opticdev.sdk

import com.opticdev.sdk.SdkDescription
import org.scalatest.FunSpec
import play.api.libs.json.Json

import scala.io.Source

class SdkDescriptionTest extends FunSpec {
  describe("Sdk Descriptions") {

    describe("parsing") {

      describe("from Json") {

        it("finds all schemas for simple Lens") {
          val jsonString = Source.fromFile("test-examples/resources/sdkDescriptions/ImportExample.json").getLines.mkString
          val description = SdkDescription.fromJson(Json.parse(jsonString)).get
          assert(description.schemas.size === 1)
          assert(description.lenses.size === 1)
        }

        it("finds all schemas for advanced lens") {
          val jsonString = Source.fromFile("test-examples/resources/sdkDescriptions/RequestSdkDescription.json").getLines.mkString
          val description = SdkDescription.fromJson(Json.parse(jsonString)).get
          assert(description.schemas.size === 2)
          assert(description.lenses.size === 2)
        }

      }

    }

  }
}
