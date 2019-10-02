package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc._
import com.seamless.contexts.shapes.ShapesState
import com.seamless.ddd.EventStore
import com.seamless.diff.RequestDiffer.{NoDiff, UnmatchedResponseBodyShape}
import com.seamless.diff.ShapeDiffer.KeyShapeMismatch
import com.seamless.diff.interpreters.BasicDiffInterpreter
import com.seamless.serialization.EventSerialization
import io.circe.Json
import io.circe.literal._
import org.scalatest.FunSpec


class RequestDifferSpec extends FunSpec {
  case class DiffAndInterpretation(result: RequestDiffer.RequestDiffResult, interpretation: DiffInterpretation)
  case class DiffSessionFixture(eventStore: EventStore[RfcEvent], rfcId: String, rfcService: RfcService) {
    def execute(commands: Seq[RfcCommand]): RfcState = {
      rfcService.handleCommandSequence(rfcId, commands)
      rfcService.currentState(rfcId)
    }

    def getDiff(interaction: ApiInteraction) = {
      val rfcState = rfcService.currentState(rfcId)
      val interpreter = new BasicDiffInterpreter(rfcState.shapesState)
      val diff = RequestDiffer.compare(interaction, rfcState)
      val interpretation = interpreter.interpret(diff)
//      println(diff)
//      println(interpretation)
      DiffAndInterpretation(diff, if (interpretation.isEmpty) null else interpretation.head)
    }

    def events() = {
      println(eventStore.listEvents(rfcId))
    }
  }
  def fixture(rawEvents: Json) = {
    val events = EventSerialization.fromJson(rawEvents)
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append(rfcId, events.get)
    val rfcService: RfcService = new RfcService(eventStore)
    DiffSessionFixture(eventStore, rfcId, rfcService)
  }

  describe("json response using parameterized shapes") {
    describe("PetListResponse") {
      val rawEvents: Json =
        json"""
[
{"PathComponentAdded":{"name":"generics","parentPathId":"root","pathId":"_GenericsPath"}},
{"RequestAdded":{"httpMethod":"GET","pathId":"_GenericsPath","requestId":"_GET/generics"}},
{"ResponseAdded":{"httpStatusCode":200,"requestId":"_GET/generics","responseId":"_GET/generics-200"}},
{"ShapeAdded":{"baseShapeId":"$$object","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"_InlineResponseForGET/generics"}},
{"ResponseBodySet":{"bodyDescriptor":{"httpContentType":"application/json","isRemoved":false,"shapeId":"_InlineResponseForGET/generics"},"responseId":"_GET/generics-200"}},
{"ShapeAdded":{"baseShapeId":"$$object","name":"PaginationWrapper","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"_PaginationWrapper"}},
{"ShapeParameterAdded":{"name":"","shapeDescriptor":{"ProviderInShape":{"consumingParameterId":"_PaginationWrapper.T","providerDescriptor":{"NoProvider":{}},"shapeId":"_PaginationWrapper"}},"shapeId":"_PaginationWrapper","shapeParameterId":"_PaginationWrapper.T"}},
{"ShapeParameterRenamed":{"name":"T","shapeParameterId":"_PaginationWrapper.T"}},
{"FieldAdded":{"fieldId":"_ItemsField","name":"","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_ItemsField","shapeId":"$$string"}},"shapeId":"_PaginationWrapper"}},
{"FieldRenamed":{"fieldId":"_ItemsField","name":"items"}},
{"FieldShapeSet":{"shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_ItemsField","shapeId":"$$list"}}}},
{"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInField":{"consumingParameterId":"$$listItem","fieldId":"_ItemsField","providerDescriptor":{"ParameterProvider":{"shapeParameterId":"_PaginationWrapper.T"}}}}}},
{"ShapeAdded":{"baseShapeId":"$$object","name":"Pet","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"_Pet"}},
{"FieldAdded":{"fieldId":"_PetNameField","name":"","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_PetNameField","shapeId":"$$string"}},"shapeId":"_Pet"}},
{"FieldAdded":{"fieldId":"_PetBirthdateField","name":"","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_PetBirthdateField","shapeId":"$$string"}},"shapeId":"_Pet"}},
{"FieldRenamed":{"fieldId":"_PetNameField","name":"name"}},
{"FieldRenamed":{"fieldId":"_PetBirthdateField","name":"birthdate"}},
{"ShapeAdded":{"baseShapeId":"$$object","name":"Owner","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"_Owner"}},
{"FieldAdded":{"fieldId":"_OwnerIdField","name":"","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_OwnerIdField","shapeId":"$$string"}},"shapeId":"_Owner"}},
{"FieldShapeSet":{"shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_OwnerIdField","shapeId":"$$identifier"}}}},
{"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInField":{"consumingParameterId":"$$identifierInner","fieldId":"_OwnerIdField","providerDescriptor":{"ShapeProvider":{"shapeId":"$$number"}}}}}},
{"FieldRenamed":{"fieldId":"_OwnerIdField","name":"id"}},
{"FieldAdded":{"fieldId":"_OwnerNameField","name":"","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_OwnerNameField","shapeId":"$$string"}},"shapeId":"_Owner"}},
{"FieldRenamed":{"fieldId":"_OwnerNameField","name":"name"}},
{"FieldAdded":{"fieldId":"_PetCurrenOwnerIdField","name":"","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_PetCurrenOwnerIdField","shapeId":"$$string"}},"shapeId":"_Pet"}},
{"FieldRenamed":{"fieldId":"_PetCurrenOwnerIdField","name":"currentOwnerId"}},
{"FieldShapeSet":{"shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"_PetCurrenOwnerIdField","shapeId":"$$reference"}}}},
{"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInField":{"consumingParameterId":"$$referenceInner","fieldId":"_PetCurrenOwnerIdField","providerDescriptor":{"ShapeProvider":{"shapeId":"_Owner"}}}}}},
{"ShapeAdded":{"baseShapeId":"$$object","name":"PetListResponse","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"_PetListResponse"}},
{"BaseShapeSet":{"baseShapeId":"_PaginationWrapper","shapeId":"_PetListResponse"}},
{"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"consumingParameterId":"_PaginationWrapper.T","providerDescriptor":{"ShapeProvider":{"shapeId":"_Pet"}},"shapeId":"_PetListResponse"}}}},
{"BaseShapeSet":{"baseShapeId":"_PetListResponse","shapeId":"_InlineResponseForGET/generics"}}
]
"""

      it("should notice mismatched fields in the Pet shape") {
        val request = ApiRequest("/generics", "GET", "*/*", None)
        val response = ApiResponse(200, "application/json",
          Some(json"""{
"items": [
  {"name":"pet1","birthdate":1,"currentOwnerId":3}
]
                }"""))

        val f = fixture(rawEvents)
        val interaction = ApiInteraction(request, response)
        var r = f.getDiff(interaction)
        assert(r.result.isInstanceOf[UnmatchedResponseBodyShape])
        assert(r.result.asInstanceOf[UnmatchedResponseBodyShape].shapeDiff.asInstanceOf[KeyShapeMismatch].fieldId == "_PetBirthdateField")
        f.execute(r.interpretation.commands)

        r = f.getDiff(interaction)
        assert(r.result == NoDiff())
      }
    }
  }

  describe("json array response body") {
    val request = ApiRequest("/todos", "GET", "*/*", None)
    val rawEvents =
      json"""
        [
{"APINamed":{"name":"ABC"}},
{"PathComponentAdded":{"name":"todos","parentPathId":"root","pathId":"path_/todos"}},
{"RequestAdded":{"httpMethod":"GET","pathId":"path_/todos","requestId":"request_1"}},
{"ResponseAdded":{"httpStatusCode":200,"requestId":"request_1","responseId":"response_1"}},
{"ShapeAdded":{"baseShapeId":"$$list","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"Shape1_0"}},
{"ShapeAdded":{"baseShapeId":"$$object","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"Shape1_1"}},
{"ShapeAdded":{"baseShapeId":"$$number","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"Shape1_3"}},
{"FieldAdded":{"fieldId":"Shape1_2","name":"__v","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"Shape1_2","shapeId":"Shape1_3"}},"shapeId":"Shape1_1"}},
{"ShapeAdded":{"baseShapeId":"$$string","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"Shape1_5"}},
{"FieldAdded":{"fieldId":"Shape1_4","name":"_id","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"Shape1_4","shapeId":"Shape1_5"}},"shapeId":"Shape1_1"}},
{"ShapeAdded":{"baseShapeId":"$$boolean","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"Shape1_7"}},
{"FieldAdded":{"fieldId":"Shape1_6","name":"isDone","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"Shape1_6","shapeId":"Shape1_7"}},"shapeId":"Shape1_1"}},
{"ShapeAdded":{"baseShapeId":"$$string","name":"","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"shapeId":"Shape1_9"}},
{"FieldAdded":{"fieldId":"Shape1_8","name":"task","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"Shape1_8","shapeId":"Shape1_9"}},"shapeId":"Shape1_1"}},
{"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"consumingParameterId":"$$listItem","providerDescriptor":{"ShapeProvider":{"shapeId":"Shape1_1"}},"shapeId":"Shape1_0"}}}},
{"ResponseBodySet":{"bodyDescriptor":{"httpContentType":"application/json","isRemoved":false,"shapeId":"Shape1_0"},"responseId":"response_1"}}
]
          """

    describe("empty array") {
      val f = fixture(rawEvents)
      val response = ApiResponse(200, "application/json", Some(json"""[]"""))
      val interaction = ApiInteraction(request, response)

      it("should not detect any difference") {
        val r = f.getDiff(interaction)
        assert(r.result == NoDiff())
      }
    }
    describe("array mismatched fields") {
      val f = fixture(rawEvents)

      val response = ApiResponse(200, "application/json",
        Some(json"""
[{
    "__v": 0,
    "_id": 1,
    "task": "Post 1",
    "isDone": true
},{
    "__v": 0,
    "_id": 2,
    "task": "Post 2",
    "isDone": false
},{
    "__v": 0,
    "_id": 3,
    "task": "Post 3",
    "isDone": false
}]
          """))
      val interaction = ApiInteraction(request, response)

      it("should detect mismatched fields") {
        var r = f.getDiff(interaction)
        assert(r.result.asInstanceOf[UnmatchedResponseBodyShape].shapeDiff.isInstanceOf[KeyShapeMismatch])
        f.execute(r.interpretation.commands)

        r = f.getDiff(interaction)
        assert(r.result == NoDiff())
      }
    }

  }
  describe("json object response body") {
    val request = ApiRequest("/", "GET", "*/*", None)

    val events = EventSerialization.fromJson(json"""[]""")
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append(rfcId, events.get)
    val rfcService: RfcService = new RfcService(eventStore)

    it("should yield a missing key diff") {
      val shapesState: ShapesState = rfcService.currentState(rfcId).shapesState
      val interpreter = new BasicDiffInterpreter(shapesState)
      val response = ApiResponse(200, "application/json",
        Some(json"""
{
    "id": 2,
    "title": "Post 2",
    "deleted": false
}
          """))
      val interaction = ApiInteraction(request, response)
      var diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
//      assert(diff == RequestDiffer.UnmatchedHttpMethod("root", "GET"))
      var interpretation = interpreter.interpret(diff).head
      println(diff, interpretation.description)
      val requestId = interpretation.commands.head.asInstanceOf[AddRequest].requestId

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))
//      assert(diff == RequestDiffer.UnmatchedHttpStatusCode(requestId, 200))
      interpretation = interpreter.interpret(diff).head
      println(diff, interpretation.description)
      val responseId = interpretation.commands.head.asInstanceOf[AddResponse].responseId

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))

      assert(diff == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.UnsetShape(
        json"""{
           "id" : 2,
           "title" : "Post 2",
           "deleted" : false
         }""")))
      interpretation = interpreter.interpret(diff).head
      println(diff, interpretation.description)

      rfcService.handleCommandSequence(rfcId, interpretation.commands)
      diff = RequestDiffer.compare(interaction, rfcService.currentState(rfcId))

      assert(diff == RequestDiffer.NoDiff())
    }
  }
}
