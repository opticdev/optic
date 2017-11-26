package com.opticdev.sdk

import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.sdk.descriptions.ComponentOptions

class SdkComponentOptionsSpec extends FunSpec {

  describe("parsing") {

    it("works on valid input") {
      val validInput = """{
                         "lookupTable": null,
                         "invariant": false,
                         "parser": null,
                         "mutator": null
                       }"""


      val result = ComponentOptions.fromJson(Json.parse(validInput))

      assert(result.isInstanceOf[ComponentOptions])
      assert(!result.lookupTable.isDefined)
      assert(!result.parser.isDefined)
      assert(!result.mutator.isDefined)
    }

    describe("lookupTables") {

      it("works when valid ") {
        val validInput =
          """{
                         "lookupTable": { "key": ["value1", "value2"] },
                         "invariant": false,
                         "parser": null,
                         "mutator": null
                       }"""

        val result = ComponentOptions.fromJson(Json.parse(validInput))
        assert(result.lookupTable.get == Map("key" -> Vector("value1", "value2")))
      }
    }

    it("fails when invalid") {
      val invalidInput =
        """{
                         "lookupTable": [],
                         "invariant": false,
                         "parser": null,
                         "mutator": null
                       }"""


      val invalidInput2 =
        """{
                         "lookupTable": { "key": {} },
                         "invariant": false,
                         "parser": null,
                         "mutator": null
                       }"""



      assertThrows[Error] {
        ComponentOptions.fromJson(Json.parse(invalidInput))
        ComponentOptions.fromJson(Json.parse(invalidInput2))
      }

    }

    it("fails on invalid input") {

      val invalidInput =
        """{
                         "lookupTable": null,
                         "not-invarient": false,
                         "parser": 31,
                         "mutator": 12
                       }"""


      assertThrows[Error] {
        ComponentOptions.fromJson(Json.parse(invalidInput))
      }

    }

  }

}
