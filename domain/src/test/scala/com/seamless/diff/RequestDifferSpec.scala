package com.seamless.diff

import com.seamless.contexts.rfc._
import com.seamless.serialization.CommandSerialization
import io.circe.literal._
import org.scalatest.FunSpec


class RequestDifferSpec extends FunSpec with JsonFileFixture {
  describe("json object response body") {
    val request = ApiRequest("/abc", "GET", "*/*", null)
    val response = ApiResponse(200, "application/json", json"""{}""")
    val interaction = ApiInteraction(request, response)
    val commands = CommandSerialization.fromJson(json"""
                                                        [
  {
    "APINamed": {
      "name": "ddoshi"
    }
  },
  {
    "PathComponentAdded": {
      "name": "typicode",
      "parentPathId": "root",
      "pathId": "path_1"
    }
  },
  {
    "PathComponentAdded": {
      "name": "demo",
      "parentPathId": "path_1",
      "pathId": "path_2"
    }
  },
  {
    "PathComponentAdded": {
      "name": "posts",
      "parentPathId": "path_2",
      "pathId": "path_3"
    }
  },
  {
    "PathParameterAdded": {
      "name": "postId",
      "parentPathId": "path_3",
      "pathId": "path_4"
    }
  },
  {
    "ShapeAdded": {
      "baseShapeId": "$$string",
      "name": "",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "shapeId": "shape_nDfXcTEWL9"
    }
  },
  {
    "PathParameterShapeSet": {
      "pathId": "path_4",
      "shapeDescriptor": {
        "isRemoved": false,
        "shapeId": "shape_nDfXcTEWL9"
      }
    }
  }
]
    """)
    val rfcId: String = "rfc-1"
    val rfcService: RfcService = RfcServiceJSFacade.fromCommands(RfcServiceJSFacade.makeEventStore(), commands.get, rfcId)

    it("should yield a missing key diff") {
//      val diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
//      assert(diff == NoDiff())
    }
  }
}
