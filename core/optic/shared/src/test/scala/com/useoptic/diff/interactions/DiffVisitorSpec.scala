package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands
import com.useoptic.contexts.requests.Commands.{AddRequest, AddResponse, SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcServiceJSFacade}
import com.useoptic.ddd.InMemoryEventStore
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.visitors.DiffVisitors
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.diff.shapes._
import com.useoptic.types.capture._
import io.circe.literal._
import org.scalatest.FunSpec

object TestHelpers {
  def fromCommands(commands: Seq[RfcCommand]) = {
    val rfcId = "test"
    val eventStore = new InMemoryEventStore[RfcEvent]
    val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
    RfcServiceJSFacade.fromCommands(eventStore, rfcId, commands.toVector, commandContext).currentState(rfcId)
  }
}

class DiffVisitorSpec extends FunSpec {


  describe("diff visitor") {
    describe("with spec = a simple POST request") {

      val requestId = "req1"
      val responseId = "res1"
      val requestContentType = "ccc"
      val builtShape = new ShapeBuilder(json"""{"f":[123]}""", "s").run
      val initialCommands = builtShape.commands ++ Seq(
        AddRequest(requestId, Commands.rootPathId, "POST"),
        SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, builtShape.rootShapeId, isRemoved = false)),
        AddResponse(responseId, requestId, 200)
      )

      describe("with interaction not matching spec path") {
        it("should yield UnmatchedUrl diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          println(spec.requestsState.responses)
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "GET", "/asdf", "", Vector(), Body(None, None)),
            Response(200, Vector(), Body(None, None)),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(UnmatchedRequestUrl(InteractionTrail(Seq()), SpecRoot())))
        }
      }
      describe("with interaction not matching spec method") {
        it("should yield UnmatchedHttpMethod diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "GET", "/", "", Vector(), Body(None, None)),
            Response(200, Vector(), Body(None, None)),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(UnmatchedRequestMethod(InteractionTrail(Seq()), SpecRoot())))
        }
      }
      describe("with interaction not matching content type") {
        it("should yield UnmatchedRequestContentType diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", "", Vector(Header("content-type", "bbb")), Body(None, None)),
            Response(200, Vector(), Body(None, None)),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedRequestBodyContentType(InteractionTrail(Seq(Url("/"), Method("POST"), RequestBody("bbb"))), SpecRequestRoot(requestId))
          ))
        }
      }
      describe("with interaction not matching body") {
        it("should yield UnmatchedRequestBody diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", "", Vector(Header("content-type", "ccc")), Body(None, Some(json"""{"f":["abc"]}""".noSpaces))),
            Response(200, Vector(), Body(None, None)),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedRequestBodyShape(
              InteractionTrail(Seq(RequestBody("ccc"))),
              SpecRequestBody(requestId),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(0))),
                ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_3")))
              )
            )
          ))
        }
      }
      describe("with interaction not matching response status code") {
        it("should yield UnmatchedResponseStatusCode diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", "", Vector(Header("content-type", "ccc")), Body(None, Some(json"""{"f":[123]}""".noSpaces))),
            Response(304, Vector(), Body(None, None)),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedResponseStatusCode(
              InteractionTrail(Seq(ResponseStatusCode(304))),
              SpecRequestRoot(requestId)
            )
          ))
        }
      }

      describe("with interaction not matching response content type") {
        it("should yield UnmatchedResponseBodyContentType diff") {
          val spec = TestHelpers.fromCommands(initialCommands ++ Seq(
            SetResponseBodyShape(responseId, ShapedBodyDescriptor("ccc222", builtShape.rootShapeId, isRemoved = false))
          ))
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", "", Vector(Header("content-type", "ccc")), Body(None, Some(json"""{"f":[123]}""".noSpaces))),
            Response(200, Vector(Header("content-type", "bbb222")), Body(None, Some(json"""{"f":["abc"]}""".noSpaces))),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedResponseBodyContentType(
              InteractionTrail(Seq(ResponseBody("bbb222", 200))),
              SpecResponseBody(responseId)
            )
          ))
        }
      }

      describe("with interaction not matching response body shape") {
        it("should yield UnmatchedResponseBodyShape diff") {
          val spec = TestHelpers.fromCommands(initialCommands ++ Seq(
            SetResponseBodyShape(responseId, ShapedBodyDescriptor("ccc222", builtShape.rootShapeId, isRemoved = false))
          ))
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", "", Vector(Header("content-type", "ccc")), Body(None, Some(json"""{"f":[123]}""".noSpaces))),
            Response(200, Vector(Header("content-type", "ccc222")), Body(None, Some(json"""{"f":["abc"]}""".noSpaces))),
            Vector()
          )
          val visitors = new DiffVisitors()
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedResponseBodyShape(
              InteractionTrail(Seq(ResponseBody("ccc222", 200))),
              SpecResponseBody(responseId),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(0))),
                ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_3")))
              )
            )
          ))
        }
      }

    }
  }
}

