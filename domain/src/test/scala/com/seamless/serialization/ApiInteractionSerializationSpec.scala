package com.seamless.serialization

import io.circe.Json
import org.scalatest.FunSpec
import com.seamless.diff._

class ApiInteractionSerializationSpec extends FunSpec {

  describe("GET Request") {
    describe("204 No Content") {
      it("should accept null bodies") {
        val interaction = ApiInteraction(
          ApiRequest("uuu", "mmm", "", "ccc", None),
          ApiResponse(204, "ccc", None)
        )
        val asJson = ApiInteractionSerialization.asJson(interaction)
        println(asJson)

        val fromJson = ApiInteractionSerialization.fromJson(asJson)
        println(fromJson.get)

        assert(fromJson.get == interaction)
      }
    }
    describe("from raw json") {

      it("should parse") {
        import io.circe.literal._
        val x: Json =
          json"""{
            "id": 2,
            "title": "Post 2"
          }"""
        println(x)
      }
    }
  }
}
