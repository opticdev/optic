package com.useoptic.diff.helpers

import com.useoptic.contexts.requests.Commands.ShapedBodyDescriptor
import com.useoptic.contexts.requests.{Commands => RequestsCommands}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.initial.{DistributionAwareShapeBuilder, ShapeBuildingStrategy}
import com.useoptic.diff.interactions.{InteractionTrail, ResponseBody, SpecResponseBody, TestHelpers, UnmatchedResponseBodyShape}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.diff.shapes.resolvers.DefaultShapesResolvers
import com.useoptic.diff.shapes.{JsonTrail, ListItemTrail, ObjectFieldTrail, ShapeTrail, UnmatchedShape}
import com.useoptic.dsa.{OpticIds, SequentialIdGenerator}
import com.useoptic.types.capture.{HttpInteraction, JsonLikeFrom}
import io.circe.Json
import org.scalatest.FunSpec
import io.circe.literal._

class SpecHelpers {

  val requestIdGenerator = new SequentialIdGenerator("request")
  val responseIdGenerator = new SequentialIdGenerator("response")
  val shapeIdPrefixGenerator = new SequentialIdGenerator("s")

  implicit val shapeBuildingStrategy = ShapeBuildingStrategy.inferPolymorphism

  def simpleGet(responseBody: Json): Seq[RfcCommand] = {
    val requestId = requestIdGenerator.nextId()
    val responseId = responseIdGenerator.nextId()
    val builtShape = DistributionAwareShapeBuilder.toCommands(Vector(JsonLikeFrom.json(responseBody).get))(OpticIds.newDeterministicIdGenerator, ShapeBuildingStrategy.inferPolymorphism)
    builtShape._2.flatten ++ Seq(
      RequestsCommands.AddRequest(requestId, "root", "GET"),
      RequestsCommands.AddResponse(responseId, requestId, 200),
      RequestsCommands.SetResponseBodyShape(responseId, ShapedBodyDescriptor("application/json", builtShape._1, isRemoved = false))
    )
  }

  def simplePost(requestBody: Json): Seq[RfcCommand] = {
    val requestId = requestIdGenerator.nextId()
    val responseId = responseIdGenerator.nextId()
    val builtShape = DistributionAwareShapeBuilder.toCommands(Vector(JsonLikeFrom.json(requestBody).get))(OpticIds.newDeterministicIdGenerator, ShapeBuildingStrategy.inferPolymorphism)
    builtShape._2.flatten ++ Seq(
      RequestsCommands.AddRequest(requestId, "root", "POST"),
      RequestsCommands.SetRequestBodyShape(requestId, ShapedBodyDescriptor("application/json", builtShape._1, isRemoved = false)),
      RequestsCommands.AddResponse(responseId, requestId, 204)
    )
  }
}

class DiffHelpersSpec extends FunSpec {
  def fixture(commands: Seq[RfcCommand], interactions: Seq[HttpInteraction]) = {
    val rfcState: RfcState = TestHelpers.fromCommands(commands)
    val resolvers = new DefaultShapesResolvers(rfcState)
    val aggregatedDiff = DiffHelpers.diffAll(resolvers, rfcState, interactions)
    aggregatedDiff
  }

  def mapFixture(commands: Seq[RfcCommand], interactions: Seq[HttpInteraction]) = {
    val rfcState: RfcState = TestHelpers.fromCommands(commands)
    val resolvers = new DefaultShapesResolvers(rfcState)
    val grouped = DiffHelpers.groupByDiffs(resolvers, rfcState, interactions)
    grouped
  }

  describe("many interactions to the same path") {
    val specHelpers = new SpecHelpers()
    val commands: Seq[RfcCommand] = specHelpers.simpleGet(json"""{"k": [{"a": 1, "b": false}]}""")
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
              SpecResponseBody("response1"),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("k"))),
                ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2")))
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
              SpecResponseBody("response1"),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("k"))),
                ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2")))
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
              SpecResponseBody("response1"),
              UnmatchedShape(
                JsonTrail(Seq(JsonObjectKey("k"))),
                ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2")))
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
            SpecResponseBody("response1"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2")))
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
            SpecResponseBody("response1"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2")))
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
            SpecResponseBody("response1"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2"))
              )
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
            SpecResponseBody("response1"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"))),
              ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2")))
            )
          )
          assert(groups(key1) == Seq(interactions(0)))

          val key2 = UnmatchedResponseBodyShape(
            InteractionTrail(Seq(ResponseBody("application/json", 200))),
            SpecResponseBody("response1"),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("k"), JsonArrayItem(0), JsonObjectKey("b"))),
              ShapeTrail("s1_0", Seq(ObjectFieldTrail("s1_1", "s1_2"), ListItemTrail("s1_2", "s1_8"), ObjectFieldTrail("s1_6", "s1_7")))
            )
          )
          assert(groups(key2) == Seq(interactions(1)))
        }
      }
    }
  }
}
