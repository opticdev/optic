package com.useoptic.diff

import com.useoptic.contexts.requests.Commands._
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc._
import com.useoptic.contexts.shapes.Commands.{AddField, AddShape, FieldShapeFromShape}
import com.useoptic.contexts.shapes.ShapesHelper.StringKind
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesState}
import com.useoptic.ddd.EventStore
import com.useoptic.diff.RequestDiffer.{UnmatchedQueryParameterShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.ShapeDiffer.{KeyShapeMismatch, UnexpectedObjectKey, UnsetObjectKey, WeakNoDiff}
import com.useoptic.diff.interpreters.{BasicDiffInterpreter, QueryParameterInterpreter}
import com.useoptic.diff.query.{JvmQueryStringParser, QueryStringDiffer}
import com.useoptic.serialization.EventSerialization
import io.circe.{Json, JsonNumber, JsonObject}
import io.circe.literal._
import org.scalatest.FunSpec

class RequestDifferSpec extends FunSpec {
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
  case class DiffAndInterpretation(result: RequestDiffer.RequestDiffResult, interpretation: DiffInterpretation)
  case class DiffSessionFixture(eventStore: EventStore[RfcEvent], rfcId: String, rfcService: RfcService) {
    def execute(commands: Seq[RfcCommand]): RfcState = {
      rfcService.handleCommandSequence(rfcId, commands, commandContext)
      rfcService.currentState(rfcId)
    }

    def getDiffs(interaction: ApiInteraction, pluginRegistry: Option[PluginRegistry] = None) = {
      val rfcState = rfcService.currentState(rfcId)
      val plugins = pluginRegistry match {
        case None => PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState)
        case Some(r) => r
      }
      val diffs = RequestDiffer.compare(interaction, rfcState, plugins)
      val interpreter = new BasicDiffInterpreter(rfcState.shapesState)
      (diffs, interpreter)
    }

    def getDiff(interaction: ApiInteraction) = {
      val (diffs, interpreter) = getDiffs(interaction)

      val diff = diffs.next()
      val interpretation = interpreter.interpret(diff)
      //      println(diff)
      //      println(interpretation)
      DiffAndInterpretation(diff, if (interpretation.isEmpty) null else interpretation.head)
    }

    def getDiffWithQueryStringParser(interaction: ApiInteraction, parsedQueryString: Json) = {
      val rfcState = rfcService.currentState(rfcId)
      val parser = new JvmQueryStringParser(parsedQueryString)
      val differ = new QueryStringDiffer(rfcState.shapesState, parser)
      val plugins = PluginRegistry(differ)
      val diffs = RequestDiffer.compare(interaction, rfcState, plugins)
      val interpreter = new BasicDiffInterpreter(rfcState.shapesState)
      (diffs, interpreter)
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

  def commandsFixture(initialCommands: Seq[RfcCommand]) = {
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), initialCommands: _*)
    DiffSessionFixture(eventStore, rfcId, rfcService)
  }

  describe("query parameters") {
    describe("when there is no parameter in the spec") {
      val commands = Seq(
        AddRequest("req1", "root", "GET"),
        AddResponse("res1", "req1", 200)
      )
      val f = commandsFixture(commands)
      val interaction = ApiInteraction(
        ApiRequest("/", "GET", "xxx", "*/*", None),
        ApiResponse(200, "*/*", None)
      )
      it("should detect no diff when there is no query parameter in the request") {
        val (diff, _) = f.getDiffWithQueryStringParser(interaction, json"""{}""")
        assert(diff.isEmpty)
      }
      it("should detect a diff when there is a query parameter in the request") {
        val (diff, _) = f.getDiffWithQueryStringParser(interaction, json"""{"key":"value"}""")
        assert(diff.hasNext)
        val next = diff.next()
        assert(next.isInstanceOf[UnmatchedQueryParameterShape])
        assert(next.asInstanceOf[UnmatchedQueryParameterShape].shapeDiff.isInstanceOf[UnexpectedObjectKey])
        val rfcState = f.rfcService.currentState(f.rfcId)
        val interpretations = new QueryParameterInterpreter(rfcState.shapesState).interpret(next)
        f.execute(interpretations.head.commands)
      }
    }
    describe("when there is a parameter in the spec") {
      val commands = Seq(
        AddRequest("req1", "root", "GET"),
        AddResponse("res1", "req1", 200)
      )
      var f = commandsFixture(commands)
      val rfcState = f.rfcService.currentState(f.rfcId)
      val queryParameter = rfcState.requestsState.requestParameters.find(x => x._2.requestParameterDescriptor.pathId == "root" && x._2.requestParameterDescriptor.httpMethod == "GET")
      val shapeId = (queryParameter.get._2.requestParameterDescriptor.shapeDescriptor.asInstanceOf[ShapedRequestParameterShapeDescriptor]).shapeId
      val additionalCommands = Seq(
        AddField("field1", shapeId, "key", FieldShapeFromShape("field1", StringKind.baseShapeId))
      )
      f.execute(additionalCommands)
      f = DiffSessionFixture(f.eventStore, f.rfcId, f.rfcService)
      val interaction = ApiInteraction(
        ApiRequest("/", "GET", "xxx", "*/*", None),
        ApiResponse(200, "*/*", None)
      )
      it("should not detect a diff when the expected keys are present in the request") {
        val (diff, _) = f.getDiffWithQueryStringParser(interaction, json"""{"key":"vvv"}""")
        assert(diff.isEmpty)
      }
      it("should detect a diff when an expected key is not present in the request") {
        val (diff, _) = f.getDiffWithQueryStringParser(interaction, json"""{"x":"y"}""")
        assert(diff.hasNext)
        var next = diff.next()
        assert(next.isInstanceOf[UnmatchedQueryParameterShape])
        assert(next.asInstanceOf[UnmatchedQueryParameterShape].shapeDiff.isInstanceOf[UnsetObjectKey])
        assert(diff.hasNext)
        next = diff.next()
        assert(next.isInstanceOf[UnmatchedQueryParameterShape])
        assert(next.asInstanceOf[UnmatchedQueryParameterShape].shapeDiff.isInstanceOf[UnexpectedObjectKey])
        assert(diff.isEmpty)
      }
    }
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
      describe("iterator") {

        it("should notice unmatched url") {

          val request = ApiRequest("/unrecognized", "GET", "", "*/*", None)
          val response = ApiResponse(200, "*/*", None)

          val f = fixture(rawEvents)
          val interaction = ApiInteraction(request, response)
          val rfcState = f.rfcService.currentState(f.rfcId)
          val diffs = RequestDiffer.compare(interaction, rfcState, PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState))
          val diff = diffs.next()
          println(diff)
          assert(diff == RequestDiffer.UnmatchedUrl(interaction))
          assert(diffs.isEmpty)
        }
        it("should notice unmatched operation") {

          val request = ApiRequest("/generics", "POST", "", "*/*", None)
          val response = ApiResponse(200, "*/*", None)

          val f = fixture(rawEvents)
          val interaction = ApiInteraction(request, response)
          val rfcState = f.rfcService.currentState(f.rfcId)
          val diffs = RequestDiffer.compare(interaction, rfcState, PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState))
          val diff = diffs.next()
          println(diff)
          assert(diff == RequestDiffer.UnmatchedHttpMethod("_GenericsPath", interaction.apiRequest.method, interaction))
          assert(diffs.isEmpty)
        }
        it("should notice mismatched fields in the Pet shape") {
          val request = ApiRequest("/generics", "GET", "", "*/*", None)
          val response = ApiResponse(200, "application/json",
            Some(
              json"""{
  "items": [
    {"name":"pet1","birthdate":1,"currentOwnerId":3}
  ]
                  }"""))

          val f = fixture(rawEvents)
          val interaction = ApiInteraction(request, response)

          var r = f.getDiff(interaction)
          assert(r.result.isInstanceOf[UnmatchedResponseBodyShape])
          assert(r.result.asInstanceOf[UnmatchedResponseBodyShape].shapeDiff.isInstanceOf[KeyShapeMismatch])
          assert(r.result.asInstanceOf[UnmatchedResponseBodyShape].shapeDiff.asInstanceOf[KeyShapeMismatch].fieldId == "_PetBirthdateField")
          println(r.interpretation)
          f.execute(r.interpretation.commands)

          r = f.getDiff(interaction)
          assert(r.result.isInstanceOf[UnmatchedResponseBodyShape])
          assert(r.result.asInstanceOf[UnmatchedResponseBodyShape].shapeDiff.isInstanceOf[WeakNoDiff])
        }
      }
    }
  }

  describe("json array response body") {
    val request = ApiRequest("/todos", "GET", "", "*/*", None)
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
        val (diffs, _) = f.getDiffs(interaction)
        assert(diffs.isEmpty)
      }
    }
    describe("array mismatched fields") {
      val f = fixture(rawEvents)

      val response = ApiResponse(200, "application/json",
        Some(
          json"""
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
        val r = f.getDiff(interaction)
        assert(r.result.asInstanceOf[UnmatchedResponseBodyShape].shapeDiff.isInstanceOf[KeyShapeMismatch])
        f.execute(r.interpretation.commands)

        val (diffs, _) = f.getDiffs(interaction)
        assert(diffs.isEmpty)
      }
    }

  }
//  describe("json object response body") {
//    val request = ApiRequest("/", "GET", "", "*/*", None)
//
//    val events = EventSerialization.fromJson(json"""[]""")
//    val rfcId: String = "rfc-1"
//    val eventStore = RfcServiceJSFacade.makeEventStore()
//    eventStore.append(rfcId, events.get)
//    val rfcService: RfcService = new RfcService(eventStore)
//
//    it("should yield a missing key diff") {
//      val shapesState: ShapesState = rfcService.currentState(rfcId).shapesState
//      val interpreter = new BasicDiffInterpreter(shapesState)
//      val response = ApiResponse(200, "application/json",
//        Some(
//          json"""
//{
//    "id": 2,
//    "title": "Post 2",
//    "deleted": false
//}
//          """))
//      val interaction = ApiInteraction(request, response)
//      var rfcState = rfcService.currentState(rfcId)
//      var diff = RequestDiffer.compare(interaction, rfcState, PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState))
//      assert(diff.hasNext)
//      var next = diff.next()
//      assert(next == RequestDiffer.UnmatchedHttpMethod("root", interaction.apiRequest.method, interaction))
//      var interpretation = interpreter.interpret(next).head
//      //      println(diff, interpretation.description)
//      val requestId = interpretation.commands.head.asInstanceOf[AddRequest].requestId
//
//      rfcService.handleCommandSequence(rfcId, interpretation.commands, commandContext)
//      rfcState = rfcService.currentState(rfcId)
//      diff = RequestDiffer.compare(interaction, rfcState, PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState))
//      assert(diff.hasNext)
//      next = diff.next()
//      assert(next == RequestDiffer.UnmatchedHttpStatusCode(requestId, 200, interaction))
//      interpretation = interpreter.interpret(next).head
//      //      println(diff, interpretation.description)
//      val responseId = interpretation.commands.head.asInstanceOf[AddResponse].responseId
//
//      rfcService.handleCommandSequence(rfcId, interpretation.commands, commandContext)
//      rfcState = rfcService.currentState(rfcId)
//      diff = RequestDiffer.compare(interaction, rfcState, PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState))
//      assert(diff.hasNext)
//      next = diff.next()
//
//      assert(next == RequestDiffer.UnmatchedResponseBodyShape(responseId, "application/json", 200, ShapeDiffer.UnsetShape(
//        ShapeLikeJs(Some(json"""{
//           "id" : 2,
//           "title" : "Post 2",
//           "deleted" : false
//         }""")))))
//      interpretation = interpreter.interpret(next).head
//      //      println(diff, interpretation.description)
//
//      rfcService.handleCommandSequence(rfcId, interpretation.commands, commandContext)
//      rfcState = rfcService.currentState(rfcId)
//      diff = RequestDiffer.compare(interaction, rfcState, PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState))
//
//      assert(diff.isEmpty)
//    }
//  }
}
