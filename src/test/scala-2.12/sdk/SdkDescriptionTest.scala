package sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json

import scala.io.Source

class SdkDescriptionTest extends FunSpec {
  describe("Sdk Descriptions") {

    describe("parsing") {

      describe("from Json") {
        val jsonString = Source.fromFile("src/test/resources/sdkDescriptions/ImportExample.json").getLines.mkString

        it("finds all schemas") {
          val description = SdkDescription.fromJson(Json.parse(jsonString))
          assert(description.schemas.size === 1)
          assert(description.lenses.size === 1)
        }

      }

    }

  }
}
