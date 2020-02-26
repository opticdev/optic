package com.useoptic.diff.helpers

import com.useoptic.contexts.requests.Commands.ShapedBodyDescriptor
import com.useoptic.contexts.requests.{Commands => RequestsCommands}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.{InteractionTrail, ResponseBody, SpecResponseBody, TestHelpers, UnmatchedResponseBodyShape}
import com.useoptic.diff.interactions.interpretations.InteractionHelpers
import com.useoptic.diff.shapes.{JsonArrayItem, JsonObjectKey, JsonTrail, ListItemTrail, ObjectFieldTrail, ShapeTrail, UnmatchedShape}
import com.useoptic.types.capture.HttpInteraction
import io.circe.Json
import org.scalatest.FunSpec
import io.circe.literal._

object SpecHelpers {
  var count = 0

  def nextId() = {
    count += 1
    count
  }

  def simpleGet(responseBody: Json): Seq[RfcCommand] = {
    val requestId = s"request${nextId()}"
    val responseId = s"response${nextId()}"
    val builtShape = new ShapeBuilder(responseBody, s"s${nextId()}").run
    builtShape.commands ++ Seq(
      RequestsCommands.AddRequest(requestId, "root", "GET"),
      RequestsCommands.AddResponse(responseId, requestId, 200),
      RequestsCommands.SetResponseBodyShape(responseId, ShapedBodyDescriptor("application/json", builtShape.rootShapeId, isRemoved = false))
    )
  }

  def simplePost(requestBody: Json): Seq[RfcCommand] = {
    val requestId = s"request${nextId()}"
    val responseId = s"response${nextId()}"
    val builtShape = new ShapeBuilder(requestBody, s"s${nextId()}").run
    builtShape.commands ++ Seq(
      RequestsCommands.AddRequest(requestId, "root", "POST"),
      RequestsCommands.SetRequestBodyShape(requestId, ShapedBodyDescriptor("application/json", builtShape.rootShapeId, isRemoved = false)),
      RequestsCommands.AddResponse(responseId, requestId, 204)
    )
  }
}

class DiffHelpersSpec extends FunSpec {
  def fixture(commands: Seq[RfcCommand], interactions: Seq[HttpInteraction]) = {
    val rfcState: RfcState = TestHelpers.fromCommands(commands)
    val aggregatedDiff = DiffHelpers.diffAll(rfcState, interactions)
    aggregatedDiff
  }

  def mapFixture(commands: Seq[RfcCommand], interactions: Seq[HttpInteraction]) = {
    val rfcState: RfcState = TestHelpers.fromCommands(commands)
    val grouped = DiffHelpers.groupByDiffs(rfcState, interactions)
    grouped
  }

  describe("many interactions to the same path") {
    val commands: Seq[RfcCommand] = SpecHelpers.simpleGet(json"""{"k": [{"a": 1, "b": false}]}""")
    describe("aggregate diff") {
      describe("with one interaction") {

        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{}"""),
          )
          val diff = fixture(commands, interactions)
          assert(diff == Set(
            UnmatchedResponseBodyShape(
              InteractionTrail(Seq(ResponseBody("application/json", 200))),
              SpecResponseBody("response2"),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("k"))),
                ShapeTrail("s3_0", Seq())
              )
            )
          ))
        }
      }
      describe("with two identical interactions") {
        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{}"""),
            InteractionHelpers.simpleGet(json"""{}"""),
          )
          val diff = fixture(commands, interactions)
          assert(diff == Set(
            UnmatchedResponseBodyShape(
              InteractionTrail(Seq(ResponseBody("application/json", 200))),
              SpecResponseBody("response2"),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("k"))),
                ShapeTrail("s3_0", Seq())
              )
            )
          ))
        }
      }
      describe("with two different interactions with similar diffs") {
        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{"k": 1}"""),
            InteractionHelpers.simpleGet(json"""{"k": false}"""),
          )
          val diff = fixture(commands, interactions)
          assert(diff == Set(
            UnmatchedResponseBodyShape(
              InteractionTrail(Seq(ResponseBody("application/json", 200))),
              SpecResponseBody("response2"),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("k"))),
                ShapeTrail("s3_0", Seq(ObjectFieldTrail("s3_1")))
              )
            )
          ))
        }
      }
    }

    describe("diff map") {

      describe("with one interaction") {

        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{}""")
          )
          val groups = mapFixture(commands, interactions)
          assert(groups.keySet.size == 1)
          val key = UnmatchedResponseBodyShape(
            InteractionTrail(Seq(ResponseBody("application/json", 200))),
            SpecResponseBody("response2"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s3_0", Seq())
            )
          )
          assert(groups(key) == interactions)
        }
      }
      describe("with two identical interactions") {
        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{}"""),
            InteractionHelpers.simpleGet(json"""{}"""),
          )
          val groups = mapFixture(commands, interactions)
          assert(groups.keySet.size == 1)
          val key = UnmatchedResponseBodyShape(
            InteractionTrail(Seq(ResponseBody("application/json", 200))),
            SpecResponseBody("response2"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s3_0", Seq())
            )
          )
          assert(groups(key) == interactions)
        }
      }
      describe("with two different interactions with similar diffs") {
        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{"k": 1}"""),
            InteractionHelpers.simpleGet(json"""{"k": false}"""),
          )
          val groups = mapFixture(commands, interactions)
          assert(groups.keySet.size == 1)
          val key = UnmatchedResponseBodyShape(
            InteractionTrail(Seq(ResponseBody("application/json", 200))),
            SpecResponseBody("response2"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s3_0", Seq(ObjectFieldTrail("s3_1")))
            )
          )
          assert(groups(key) == interactions)
        }
      }
      describe("with interactions with different diffs") {
        it("should group diffs") {
          val interactions: Seq[HttpInteraction] = Seq(
            InteractionHelpers.simpleGet(json"""{"k": 1}"""),
            InteractionHelpers.simpleGet(json"""{"k": [{"a": 1, "b": 1}]}"""),
          )
          val groups = mapFixture(commands, interactions)
          println(groups)
          assert(groups.keySet.size == 2)
          val key1 = UnmatchedResponseBodyShape(
            InteractionTrail(Seq(ResponseBody("application/json", 200))),
            SpecResponseBody("response2"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s3_0", Seq(ObjectFieldTrail("s3_1")))
            )
          )
          assert(groups(key1) == Seq(interactions(0)))

          val key2 = UnmatchedResponseBodyShape(
            InteractionTrail(Seq(ResponseBody("application/json", 200))),
            SpecResponseBody("response2"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"), JsonArrayItem(0), JsonObjectKey("b"))),
              ShapeTrail("s3_0", Seq(ObjectFieldTrail("s3_1"), ListItemTrail("s3_2", "s3_8"), ObjectFieldTrail("s3_6")))
            )
          )
          assert(groups(key2) == Seq(interactions(1)))
        }
      }
    }
  }
}
