package com.seamless.serialization

import org.scalatest.FunSpec
import com.seamless.diff.{ApiInteraction, ApiRequest, ApiResponse}
import io.circe._

class ApiInteractionSerializationSpec extends FunSpec {

  describe("GET Request") {
    describe("204 No Content") {
      it("should accept null bodies") {
        val interaction = ApiInteraction(
          ApiRequest("uuu", "mmm", Json.Null),
          ApiResponse(204, Json.Null)
        )
        val asJson = ApiInteractionSerialization.asJson(interaction)
        println(asJson)

        val fromJson = ApiInteractionSerialization.fromJson(asJson)
        println(fromJson.get)

        assert(fromJson.get == interaction)
      }
    }
  }
}
