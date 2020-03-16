package com.useoptic.diff.shapes

import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.TestHelpers
import com.useoptic.diff.shapes.visitors.DiffVisitors
import org.scalatest.FunSpec
import io.circe.literal._
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.types.capture.JsonLikeFrom

class DiffVisitorSpec extends FunSpec {
  describe("shape diffing") {
    describe("given a spec with a list of unknowns") {

    }
    describe("given a spec with a list of objects") {
      val builtShape = new ShapeBuilder(json"""{"f":[{"k":"v1"}, {"k":"v2"}]}""", "s").run
      println(builtShape.commands)
      val rfcState = TestHelpers.fromCommands(builtShape.commands)
      describe("when given no items") {
        it("should yield no diff") {
          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":[]}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq())
          println(visitors.visitedShapeTrails.counts)
          assert(visitors.visitedShapeTrails.counts.keys.size == 2)
          assert(visitors.visitedShapeTrails.counts(ShapeTrail("s_0", Seq())) == 1)
          assert(visitors.visitedShapeTrails.counts(ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1", "s_2")))) == 1)
        }
      }
      describe("when given matching items") {
        it("should yield no diff") {
          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":[{"k":"v1"},{"k":"v3"}]}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq())
          println(visitors.visitedShapeTrails.counts)
          assert(visitors.visitedShapeTrails.counts.keys.size == 4)
          assert(visitors.visitedShapeTrails.counts(ShapeTrail("s_0", Seq())) == 1)
          assert(visitors.visitedShapeTrails.counts(ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1", "s_2")))) == 1)
          assert(visitors.visitedShapeTrails.counts(ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_6")))) == 2)
          assert(visitors.visitedShapeTrails.counts(ShapeTrail("s_0", Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_6"), ObjectFieldTrail("s_4", "s_5")))) == 2)
        }
      }
      describe("when given some items that do not match") {
        it("should yield a diff") {

          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":[{"k2":"v1"},{"k":3}]}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(0), JsonObjectKey("k"))),
              ShapeTrail(builtShape.rootShapeId, Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_6"), ObjectFieldTrail("s_4", "s_5")))),
            UnspecifiedShape(
              JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(0), JsonObjectKey("k2"))),
              ShapeTrail(builtShape.rootShapeId, Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_6")))),
            UnmatchedShape(
              JsonTrail(Seq(JsonObjectKey("f"), JsonArrayItem(1), JsonObjectKey("k"))),
              ShapeTrail(builtShape.rootShapeId, Seq(ObjectFieldTrail("s_1", "s_2"), ListItemTrail("s_2", "s_6"), ObjectFieldTrail("s_4", "s_5"))))
          ))
        }
      }
    }
    describe("given a spec with an object") {

      val builtShape = new ShapeBuilder(json"""{"f":1}""", "s").run
      println(builtShape.commands)
      val rfcState = TestHelpers.fromCommands(builtShape.commands)
      describe("when an expected key is not present") {
        it("should yield a diff") {

          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq(UnmatchedShape(JsonTrail(Seq(JsonObjectKey("f"))), ShapeTrail(builtShape.rootShapeId, Seq(ObjectFieldTrail("s_1", "s_2"))))))
        }
      }
      describe("when an unexpected key is observed") {
        it("should yield a diff") {
          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":1,"g":"1"}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq(UnspecifiedShape(JsonTrail(Seq(JsonObjectKey("g"))), ShapeTrail(builtShape.rootShapeId, Seq()))))
        }
      }
      describe("when many unexpected keys are observed") {
        it("should yield a diff") {
          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":1,"g":"1", "h":"1", "i":"1"}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq(
            UnspecifiedShape(JsonTrail(Seq(JsonObjectKey("g"))), ShapeTrail(builtShape.rootShapeId, Seq())),
            UnspecifiedShape(JsonTrail(Seq(JsonObjectKey("h"))), ShapeTrail(builtShape.rootShapeId, Seq())),
            UnspecifiedShape(JsonTrail(Seq(JsonObjectKey("i"))), ShapeTrail(builtShape.rootShapeId, Seq())),
          ))
        }
      }
      describe("when an expected key is present") {
        it("should yield no diff") {
          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":1}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq())
        }
      }
      describe("when the field value does not match") {
        it("should yield a diff") {
          val visitors = new DiffVisitors(rfcState)
          val traverser = new Traverser(rfcState, visitors)
          traverser.traverse(JsonLikeFrom.json(json"""{"f":"1"}"""), JsonTrail(Seq()), Some(ShapeTrail(builtShape.rootShapeId, Seq())))
          assert(visitors.diffs.toSeq == Seq(
            UnmatchedShape(JsonTrail(Seq(JsonObjectKey("f"))), ShapeTrail(builtShape.rootShapeId, Seq(ObjectFieldTrail("s_1", "s_2")))))
          )
        }
      }
    }
  }
}
