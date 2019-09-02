package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.rfc._
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesState
import com.seamless.serialization.EventSerialization
import io.circe.literal._
import org.scalatest.FunSpec


class RequestDifferSpec extends FunSpec with JsonFileFixture {
  describe("json object response body") {
    val request = ApiRequest("/typicode/demo/posts/2", "GET", "*/*", null)

    val events = EventSerialization.fromJson(
      json"""
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
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append(rfcId, events.get)
    val rfcService: RfcService = new RfcService(eventStore)

    it("should yield a missing key diff") {
      val shapesState: ShapesState = rfcService.currentState(rfcId).shapesState
      val diffToCommands = new DiffToCommands(shapesState)
      val BuiltinString = shapesState.shapes("$string")
      val response = ApiResponse(200, "application/json",
        json"""
{
    "id": 2,
    "title": "Post 2",
    "deleted": false
}
          """)
      val interaction = ApiInteraction(request, response)
      var diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
      assert(diff == RequestDiffer.UnmatchedHttpMethod("path_4", "GET"))
      var interpretation = diffToCommands.interpret(diff)
      println(diff, interpretation.description)
      val requestId = interpretation.commands.head.asInstanceOf[AddRequest].requestId

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
      assert(diff == RequestDiffer.UnmatchedHttpStatusCode(requestId, 200))
      interpretation = diffToCommands.interpret(diff)
      println(diff, interpretation.description)
      val responseId = interpretation.commands.head.asInstanceOf[AddResponse].responseId

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.NoDiff()))
      interpretation = diffToCommands.interpret(diff)
      println(diff, interpretation.description)
      val objectId = interpretation.commands.head.asInstanceOf[AddShape].shapeId

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
//      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", ShapeDiffer.ExtraObjectKey(objectId, "id", ,interaction.apiResponse.body)))
      interpretation = diffToCommands.interpret(diff)
      val idFieldId = interpretation.commands.head.asInstanceOf[AddField].fieldId
      println(diff, interpretation.description)

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.KeyShapeMismatch(idFieldId, "id", BuiltinString, json"""2""")))
      interpretation = diffToCommands.interpret(diff)
      println(diff, interpretation.description)

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
//      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.ExtraObjectKey(objectId, "title")))
      interpretation = diffToCommands.interpret(diff)
      println(diff, interpretation.description)

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
//      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.ExtraObjectKey(objectId, "deleted")))
      interpretation = diffToCommands.interpret(diff)
      val deletedFieldId = interpretation.commands.head.asInstanceOf[AddField].fieldId
      println(diff, interpretation.description)

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.KeyShapeMismatch(deletedFieldId, "deleted", BuiltinString, json"""false""")))
      interpretation = diffToCommands.interpret(diff)
      println(diff, interpretation.description)


      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
      assert(diff == RequestDiffer.NoDiff)
    }
  }
}
