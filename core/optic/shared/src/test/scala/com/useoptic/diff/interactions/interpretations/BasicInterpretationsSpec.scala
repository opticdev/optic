package com.useoptic.diff.interactions.interpretations

import com.useoptic.contexts.requests.Commands
import com.useoptic.contexts.requests.Commands.ShapedBodyDescriptor
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.interpreters.BasicInterpreters
import com.useoptic.diff.interactions.visitors.DiffVisitors
import com.useoptic.diff.interactions.{InteractionTrail, Method, RequestBody, ResponseBody, SpecRequestBody, SpecRequestRoot, SpecResponseBody, SpecResponseRoot, TestHelpers, Traverser, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, Url}
import com.useoptic.diff.shapes.{JsonArrayItem, JsonObjectKey, JsonTrail, ListItemTrail, ObjectFieldTrail, ShapeTrail, UnmatchedShape}
import com.useoptic.types.capture._
import io.circe.Json
import org.scalatest.FunSpec
import io.circe.literal._

object InteractionHelpers {
  def simplePut(requestBody: Json): HttpInteraction = {
    HttpInteraction(
      "uuid",
      Request(
        "some.host",
        "PUT",
        "/",
        "",
        Vector(Header("content-type", "application/json")),
        Body(None, Some(requestBody.noSpaces))
      ),
      Response(
        200,
        Vector(),
        Body(None, None)
      ),
      Vector()
    )
  }

  def simpleGet(responseBody: Json): HttpInteraction = {
    HttpInteraction(
      "uuid",
      Request(
        "some.host",
        "GET",
        "/",
        "",
        Vector(),
        Body(None, None)
      ),
      Response(
        200,
        Vector(Header("content-type", "application/json")),
        Body(None, Some(responseBody.noSpaces))
      ),
      Vector()
    )
  }

  def simplePutWithoutBody(): HttpInteraction = {
    HttpInteraction(
      "uuid",
      Request(
        "some.host",
        "PUT",
        "/",
        "",
        Vector(Header("content-type", "application/json")),
        Body(None, None)
      ),
      Response(
        200,
        Vector(),
        Body(None, None)
      ),
      Vector()
    )
  }
}

object Helpers {
  def getDiffs(rfcState: RfcState, interaction: HttpInteraction) = {
    val visitors = new DiffVisitors()
    val traverser = new Traverser(rfcState, visitors)
    traverser.traverse(interaction)
    visitors.diffs.toSeq
  }
}

class BasicInterpretationsSpec extends FunSpec {
  describe("AddRequestBodyContentType") {

    val builtShape = new ShapeBuilder(json"""{}""", "s").run
    val initialCommands = Seq(
      Commands.AddRequest("request1", "root", "PUT")
    ) ++ builtShape.commands ++ Seq(
      Commands.SetRequestBodyShape("request1", ShapedBodyDescriptor("text/plain", builtShape.rootShapeId, false)),
      Commands.AddResponse("response1", "request1", 200)
    )
    val rfcState: RfcState = TestHelpers.fromCommands(initialCommands)
    val interaction: HttpInteraction = InteractionHelpers.simplePut(json"""{}""")

    it("should change the expected content type in the spec") {
      val diffs = Helpers.getDiffs(rfcState, interaction)
      assert(diffs == Seq(
        UnmatchedRequestBodyContentType(
          InteractionTrail(Seq(Url("/"), Method("PUT"), RequestBody("application/json"))),
          SpecRequestRoot("request1")
        )
      ))
      val diff = diffs.head
      val interpretations = new BasicInterpreters(rfcState).interpret(diff, interaction)
      assert(interpretations.length == 1)
      val interpretation = interpretations.head
      println(interpretation.commands)
      val newRfcState = TestHelpers.fromCommands(initialCommands ++ interpretation.commands)
      val newDiffs = Helpers.getDiffs(newRfcState, interaction)
      assert(newDiffs.isEmpty)
    }
  }
  describe("AddResponseBodyContentType") {

    val builtShape = new ShapeBuilder(json"""{}""", "s").run
    val initialCommands = Seq(
      Commands.AddRequest("request1", "root", "GET")
    ) ++ builtShape.commands ++ Seq(
      Commands.AddResponse("response1", "request1", 200),
      Commands.SetResponseBodyShape("response1", ShapedBodyDescriptor("text/plain", builtShape.rootShapeId, false)),
    )
    val rfcState: RfcState = TestHelpers.fromCommands(initialCommands)
    val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""{}""")

    it("should change the expected content type in the spec") {
      val diffs = Helpers.getDiffs(rfcState, interaction)
      assert(diffs == Seq(
        UnmatchedResponseBodyContentType(
          InteractionTrail(Seq(ResponseBody("application/json"))),
          SpecResponseBody("response1")
        )
      ))
      val diff = diffs.head
      val interpretations = new BasicInterpreters(rfcState).interpret(diff, interaction)
      assert(interpretations.length == 1)
      val interpretation = interpretations.head
      println(interpretation.commands)
      val newRfcState = TestHelpers.fromCommands(initialCommands ++ interpretation.commands)
      val newDiffs = Helpers.getDiffs(newRfcState, interaction)
      assert(newDiffs.isEmpty)
    }
  }
  describe("ChangeShape") {
    describe("changing a field's shape") {
      val builtShape = new ShapeBuilder(json"""{"k":1}""", "s").run
      val initialCommands = Seq(
        Commands.AddRequest("request1", "root", "PUT")
      ) ++ builtShape.commands ++ Seq(
        Commands.SetRequestBodyShape("request1", ShapedBodyDescriptor("application/json", builtShape.rootShapeId, false)),
        Commands.AddResponse("response1", "request1", 200)
      )
      val rfcState: RfcState = TestHelpers.fromCommands(initialCommands)
      val interaction: HttpInteraction = InteractionHelpers.simplePut(json"""{"k":"s"}""")
      it("should work") {
        val diffs = Helpers.getDiffs(rfcState, interaction)
        assert(diffs == Seq(
          UnmatchedRequestBodyShape(InteractionTrail(Seq(RequestBody("application/json"))), SpecRequestBody("request1"), UnmatchedShape(JsonTrail(Seq(JsonObjectKey("k"))), ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1")))))
        ))
        val diff = diffs.head
        val interpretations = new BasicInterpreters(rfcState).interpret(diff, interaction)
        assert(interpretations.length == 1)
        val interpretation = interpretations.head
        val newRfcState = TestHelpers.fromCommands(initialCommands ++ interpretation.commands)
        val newDiffs = Helpers.getDiffs(newRfcState, interaction)
        assert(newDiffs.isEmpty)
      }
    }
    describe("changing a list item's shape") {
      val builtShape = new ShapeBuilder(json"""{"k":[1]}""", "s").run
      val initialCommands = Seq(
        Commands.AddRequest("request1", "root", "PUT")
      ) ++ builtShape.commands ++ Seq(
        Commands.SetRequestBodyShape("request1", ShapedBodyDescriptor("application/json", builtShape.rootShapeId, false)),
        Commands.AddResponse("response1", "request1", 200)
      )
      val rfcState: RfcState = TestHelpers.fromCommands(initialCommands)
      val interaction: HttpInteraction = InteractionHelpers.simplePut(json"""{"k":["s"]}""")
      it("should work") {
        val diffs = Helpers.getDiffs(rfcState, interaction)
        assert(diffs == Seq(
          UnmatchedRequestBodyShape(
            InteractionTrail(Seq(RequestBody("application/json"))),
            SpecRequestBody("request1"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"), JsonArrayItem(0))),
              ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1"), ListItemTrail("s_2", "s_3")))
            )
          )
        ))
        val diff = diffs.head
        val interpretations = new BasicInterpreters(rfcState).interpret(diff, interaction)
        assert(interpretations.length == 1)
        val interpretation = interpretations.head
        val newRfcState = TestHelpers.fromCommands(initialCommands ++ interpretation.commands)
        val newDiffs = Helpers.getDiffs(newRfcState, interaction)
        assert(newDiffs.isEmpty)
      }
    }

  }
}
