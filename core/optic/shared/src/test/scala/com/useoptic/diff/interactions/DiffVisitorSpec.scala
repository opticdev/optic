package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands
import com.useoptic.contexts.requests.Commands.{AddRequest, AddResponse, SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.ddd.InMemoryEventStore
import com.useoptic.diff.initial.DistributionAwareShapeBuilder
import com.useoptic.diff.interactions.visitors.DiffVisitors
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.diff.shapes._
import com.useoptic.diff.shapes.resolvers.DefaultShapesResolvers
import com.useoptic.dsa.OpticIds
import com.useoptic.types.capture._
import io.circe.literal._
import org.scalatest.FunSpec

object TestHelpers {
  def fromCommands(commands: Seq[RfcCommand]) = {
    val rfcId = "testRfcId"
    val eventStore = new InMemoryEventStore[RfcEvent]
    val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
    RfcServiceJSFacade.fromCommands(eventStore, rfcId, commands.toVector, commandContext).currentState(rfcId)
  }

  def fromRfcStateAndCommands(rfcService: RfcService, commands: Seq[RfcCommand], rfcId: String) = {
    val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
    rfcService.handleCommandSequence(rfcId, commands, commandContext)
    rfcService.currentState(rfcId)
  }
}

class DiffVisitorSpec extends FunSpec {


  describe("diff visitor") {
    describe("with spec = a simple POST request") {

      val requestId = "req1"
      val responseId = "res1"
      val requestContentType = "ccc"
      val builtShape = DistributionAwareShapeBuilder.toCommands(Vector(JsonLikeFrom.json(json"""{"f":[123]}""").get))(OpticIds.newDeterministicIdGenerator)
      val initialCommands = builtShape._2.flatten ++ Seq(
        AddRequest(requestId, Commands.rootPathId, "POST"),
        SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, builtShape._1, isRemoved = false)),
        AddResponse(responseId, requestId, 200)
      )

      describe("with interaction not matching spec path") {
        it("should yield UnmatchedUrl diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val resolvers = new DefaultShapesResolvers(spec)

          println(spec.requestsState.responses)
          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "GET", "/asdf", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Response(200, ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Vector()
          )

          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(UnmatchedRequestUrl(InteractionTrail(Seq()), SpecRoot())))
        }
      }
      describe("with interaction not matching any specified method or status Code") {
        it("should yield UnmatchedRequestBodyContentType and UnmatchedResponseBodyContentType diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val resolvers = new DefaultShapesResolvers(spec)

          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "GET", "/", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Response(204, ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Vector()
          )
          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(
            UnmatchedRequestBodyContentType(
              InteractionTrail(Seq(Url(), Method("GET"))),
              SpecPath("root")
            ),
            UnmatchedResponseBodyContentType(
              InteractionTrail(Seq(Method("GET"),ResponseStatusCode(204))),
              SpecPath("root")
            )
          ))
        }
      }

      describe("with interaction not matching content type") {
        it("should yield UnmatchedRequestContentType diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val resolvers = new DefaultShapesResolvers(spec)


          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(Some("bbb"), ArbitraryData(None, None, None))),
            Response(200, ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Vector()
          )
          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(
            UnmatchedRequestBodyContentType(InteractionTrail(Seq(Url(), Method("POST"), RequestBody("bbb"))), SpecPath("root"))
          ))
        }
      }
      describe("with interaction not matching body") {
        it("should yield UnmatchedRequestBody diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val resolvers = new DefaultShapesResolvers(spec)


          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(Some("ccc"), ArbitraryData(None, Some(json"""{"f":["abc"]}""".noSpaces), None))),
            Response(200, ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Vector()
          )
          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(
            UnmatchedRequestBodyShape(
              InteractionTrail(Seq(RequestBody("ccc"))),
              SpecRequestBody(requestId),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(0))),
                ShapeTrail("shape_4", Seq(ObjectFieldTrail("field_1", "shape_3"), ListItemTrail("shape_3", "shape_2")))
              )
            )
          ))
        }
      }
      describe("with interaction not matching response status code") {
        it("should yield UnmatchedResponseBodyContentType diff") {
          val spec = TestHelpers.fromCommands(initialCommands)
          val resolvers = new DefaultShapesResolvers(spec)


          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(Some("ccc"), ArbitraryData(None, Some(json"""{"f":[123]}""".noSpaces), None))),
            Response(304, ArbitraryData(None, None, None), Body(None, ArbitraryData(None, None, None))),
            Vector()
          )
          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(
            UnmatchedResponseBodyContentType(
              InteractionTrail(Seq(Method("POST"),ResponseStatusCode(304))),
              SpecPath("root")
            )
          ))
        }
      }

      describe("with interaction not matching response content type") {
        it("should yield UnmatchedResponseBodyContentType diff") {
          val spec = TestHelpers.fromCommands(initialCommands ++ Seq(
            SetResponseBodyShape(responseId, ShapedBodyDescriptor("ccc222", builtShape._1, isRemoved = false))
          ))
          val resolvers = new DefaultShapesResolvers(spec)

          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(Some("ccc"), ArbitraryData(None, Some(json"""{"f":[123]}""".noSpaces), None))),
            Response(200, ArbitraryData(None, None, None), Body(Some("bbb222"), ArbitraryData(None, Some(json"""{"f":["abc"]}""".noSpaces), None))),
            Vector()
          )
          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(
            UnmatchedResponseBodyContentType(
              InteractionTrail(Seq(Method("POST"),ResponseBody("bbb222", 200))),
              SpecPath("root")
            )
          ))
        }
      }

      describe("with interaction not matching response body shape") {
        it("should yield UnmatchedResponseBodyShape diff") {
          val spec = TestHelpers.fromCommands(initialCommands ++ Seq(
            SetResponseBodyShape(responseId, ShapedBodyDescriptor("ccc222", builtShape._1, isRemoved = false))
          ))
          val resolvers = new DefaultShapesResolvers(spec)

          val interaction: HttpInteraction = HttpInteraction(
            "uuid",
            Request("hhh", "POST", "/", ArbitraryData(None, None, None), ArbitraryData(None, None, None), Body(Some("ccc"), ArbitraryData(None, Some(json"""{"f":[123]}""".noSpaces), None))),
            Response(200, ArbitraryData(None, None, None), Body(Some("ccc222"), ArbitraryData(None, Some(json"""{"f":["abc"]}""".noSpaces), None))),
            Vector()
          )
          val diffs = scala.collection.mutable.ListBuffer[InteractionDiffResult]()
          val visitors = new DiffVisitors(resolvers, (e) => diffs.append(e))
          val traverser = new Traverser(spec, visitors)
          traverser.traverse(interaction)
          assert(diffs.toSeq == Seq(
            UnmatchedResponseBodyShape(
              InteractionTrail(Seq(ResponseBody("ccc222", 200))),
              SpecResponseBody(responseId),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(0))),
                ShapeTrail("shape_4", Seq(ObjectFieldTrail("field_1", "shape_3"), ListItemTrail("shape_3", "shape_2")))
              )
            )
          ))
        }
      }

    }
  }
}

