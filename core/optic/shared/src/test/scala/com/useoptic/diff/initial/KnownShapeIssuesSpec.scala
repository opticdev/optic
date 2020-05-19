package com.useoptic.diff.initial

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.diff.shapes.resolvers.DefaultShapesResolvers
import com.useoptic.diff.shapes.{JsonLikeAndSpecDiffVisitors, JsonLikeAndSpecTraverser, ShapeDiffResult}
import com.useoptic.end_to_end.fixtures.JsonExamples
import com.useoptic.types.capture.{JsonLike, JsonLikeFrom}
import com.useoptic.ux.ShapeOnlyRenderHelper
import org.scalatest.FunSpec

import scala.util.Try

class KnownShapeIssuesSpec extends FunSpec {

  /*
  Fixture takes a set of JsonLike examples,
    - uses the DistributionAwareShapeBuilder to generate commands
    - runs those commands to yield initialState
    - computes a diff between the created shape and the examples it was built from
      - since we're computing against a Shape that has polymorphism, we expect no diff for any of the examples
      - seeing a diff is an indication that the shape is being built improperly OR the diff logic is incorrect


  Fields seem to work fine in any combination, they only break when a list is in their Shape Trail
  Meta analysis (may be wrong) -- all ListItem Resolving fails unless it's at the root or the child of an Object.
    If the shape trail is not (ListItemTrail, *) or (ObjectFieldTrail, <List>) I've never seen it work

   */

  describe("Arrays of Arrays") {

    it("when in a field") {
      val examples = Vector(
        JsonLikeFrom.json(JsonExamples.fieldOfArrayOfArray).get,
      )
      val (commands, initialSpec, diffs, renderAttempt) = run(examples)

      /* This looks correct to me, expected to yield object, w/ field 'then', that is a List[List[String]].
      Define a new shape named  that is a $object, as shape id TheRootObject
      Define a new shape named  that is a $string, as shape id TheInnermostArrayItemString
      Define a new shape named  that is a $list, as shape id TheInnermostArray
      Define a new shape named  that is a $list, as shape id TheOuterArray
      Add a field to shape TheRootObject named then with shape FieldShapeFromShape(TheFieldThatPointsToTheOuterArray,TheOuterArray) as field id TheFieldThatPointsToTheOuterArray
      Set the shape of parameter $listItem of shape TheInnermostArray to ShapeProvider(TheInnermostArrayItemString)}
      Set the shape of parameter $listItem of field TheFieldThatPointsToTheOuterArray to ShapeProvider(TheInnermostArray)
       */

      assert(diffs.isEmpty)
      /* This should not yield a diff
      UnspecifiedShape(List(JsonObjectKey(then), JsonArrayItem(0)),ShapeTrail(TheRootObject,List(ObjectFieldTrail(TheFieldThatPointsToTheOuterArray,TheOuterArray)))),
      UnspecifiedShape(List(JsonObjectKey(then), JsonArrayItem(0), JsonArrayItem(0)),ShapeTrail(TheRootObject,List(ObjectFieldTrail(TheFieldThatPointsToTheOuterArray,TheOuterArray)))),
      UnspecifiedShape(List(JsonObjectKey(then), JsonArrayItem(0), JsonArrayItem(1)),ShapeTrail(TheRootObject,List(ObjectFieldTrail(TheFieldThatPointsToTheOuterArray,TheOuterArray)))),
      UnspecifiedShape(List(JsonObjectKey(then), JsonArrayItem(0), JsonArrayItem(2)),ShapeTrail(TheRootObject,List(ObjectFieldTrail(TheFieldThatPointsToTheOuterArray,TheOuterArray)))),
      UnspecifiedShape(List(JsonObjectKey(then), JsonArrayItem(0), JsonArrayItem(3)),ShapeTrail(TheRootObject,List(ObjectFieldTrail(TheFieldThatPointsToTheOuterArray,TheOuterArray)))))
       */
    }

    it("when array at the root") {
      val examples = Vector(
        JsonLikeFrom.json(JsonExamples.arrayOfArray).get,
      )
      val (commands, initialSpec, diffs, renderAttempt) = run(examples)

      /* This looks correct to me, expected to yield List[List[String]].
      Define a new shape named  that is a $string, as shape id EpUW6u1
      Define a new shape named  that is a $list, as shape id EpUW6u2
      Define a new shape named  that is a $list, as shape id EpUW6u3
      Set the shape of parameter $listItem of shape EpUW6u2 to ShapeProvider(EpUW6u1)}
      Set the shape of parameter $listItem of shape EpUW6u3 to ShapeProvider(EpUW6u2)}
       */

      assert(diffs.isEmpty)
      /* This does not yield a diff (as expected)
        []
       */
    }

    it("when array of array of array at root") {
      val examples = Vector(
        JsonLikeFrom.json(JsonExamples.arrayOfArrayOfArray).get,
      )
      val (commands, initialSpec, diffs, renderAttempt) = run(examples)

      /* This looks correct to me, expected to yield List[List[List[String]]].
      Define a new shape named  that is a $string, as shape id 99OJfk1
      Define a new shape named  that is a $list, as shape id 99OJfk2
      Define a new shape named  that is a $list, as shape id 99OJfk3
      Define a new shape named  that is a $list, as shape id 99OJfk4
      Set the shape of parameter $listItem of shape 99OJfk2 to ShapeProvider(99OJfk1)}
      Set the shape of parameter $listItem of shape 99OJfk3 to ShapeProvider(99OJfk2)}
      Set the shape of parameter $listItem of shape 99OJfk4 to ShapeProvider(99OJfk3)}
       */
diffs.foreach(println)
      assert(diffs.isEmpty)
      /* This does not yield a diff (as expected) ????? Now I'm confused
        []
       */
    }

    it("when array is a field, within an array of objects. ie [{array: [any, any, any]}]") {
      val examples = Vector(
        JsonLikeFrom.json(JsonExamples.arrayOfObjectsWithArrayFields).get,
      )
      val (commands, initialSpec, diffs, renderAttempt) = run(examples)

      /* This looks correct to me, expected to yield List[List[String]].
      Define a new shape named  that is a $object, as shape id YDlKjt4
      Define a new shape named  that is a $number, as shape id YDlKjt1
      Define a new shape named  that is a $list, as shape id YDlKjt2
      Add a field to shape YDlKjt4 named array with shape FieldShapeFromShape(YDlKjt3,YDlKjt2) as field id YDlKjt3
      Define a new shape named  that is a $list, as shape id YDlKjt5
      Set the shape of parameter $listItem of field YDlKjt3 to ShapeProvider(YDlKjt1)
      Set the shape of parameter $listItem of shape YDlKjt5 to ShapeProvider(YDlKjt4)}
       */

      assert(diffs.isEmpty)
      /* This is an unexpected diff for each of the array items, each is an UnspecifiedShape.
        UnspecifiedShape(List(JsonArrayItem(0), JsonObjectKey(array), JsonArrayItem(0)),ShapeTrail(YDlKjt5,List(ListItemTrail(YDlKjt5,YDlKjt4), ObjectFieldTrail(YDlKjt3,YDlKjt2)))),
        UnspecifiedShape(List(JsonArrayItem(0), JsonObjectKey(array), JsonArrayItem(1)),ShapeTrail(YDlKjt5,List(ListItemTrail(YDlKjt5,YDlKjt4), ObjectFieldTrail(YDlKjt3,YDlKjt2)))),
        UnspecifiedShape(List(JsonArrayItem(0), JsonObjectKey(array), JsonArrayItem(2)),ShapeTrail(YDlKjt5,List(ListItemTrail(YDlKjt5,YDlKjt4), ObjectFieldTrail(YDlKjt3,YDlKjt2)))))
       */
    }

    it("when array is a deeply nested field of primitives") {
      val examples = Vector(
        JsonLikeFrom.json(JsonExamples.nestedArray).get,
      )
      val (commands, initialSpec, diffs, renderAttempt) = run(examples)

      /* This looks correct to me, expected to yield List[List[String]].
      Define a new shape named  that is a $object, as shape id vao2OE6
      Define a new shape named  that is a $object, as shape id vao2OE4
      Define a new shape named  that is a $string, as shape id vao2OE1
      Define a new shape named  that is a $list, as shape id vao2OE2
      Add a field to shape vao2OE4 named b with shape FieldShapeFromShape(vao2OE3,vao2OE2) as field id vao2OE3
      Add a field to shape vao2OE6 named a with shape FieldShapeFromShape(vao2OE5,vao2OE4) as field id vao2OE5
      Set the shape of parameter $listItem of field vao2OE3 to ShapeProvider(vao2OE1)
       */

      assert(diffs.isEmpty)
      /* This is an unexpected diff for each of the array items, each is an UnspecifiedShape.
        UnspecifiedShape(List(JsonObjectKey(a), JsonObjectKey(b), JsonArrayItem(0)),ShapeTrail(vao2OE6,List(ObjectFieldTrail(vao2OE5,vao2OE4), ObjectFieldTrail(vao2OE3,vao2OE2))))
       */
    }

  }


  def run(examples: Vector[JsonLike]): (Vector[RfcCommand], RfcState, Vector[ShapeDiffResult], Try[ShapeOnlyRenderHelper]) = {
    lazy val (shapeId, commands) = DistributionAwareShapeBuilder.toCommands(examples)

    def tryCommands(commands: Vector[RfcCommand]) = {
      val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
      val eventStore = RfcServiceJSFacade.makeEventStore()
      val rfcService: RfcService = new RfcService(eventStore)
      rfcService.handleCommandSequence("id", commands, commandContext)
      rfcService.currentState("id")
    }

    println("For Examples:\n ")
    println(examples.map(_.asJson.spaces2).mkString("\n"))

    println("Resulting Commands\n ")
    println(commands.flatten.mkString("\n"))

    val diffs = scala.collection.mutable.ListBuffer[ShapeDiffResult]()
    val rfcState = tryCommands(commands.flatten)


    println("\nDiff Against Self (should be empty):\n ")
    val resolvers = new DefaultShapesResolvers(rfcState)
    val traverser = new JsonLikeAndSpecTraverser(resolvers, rfcState, new JsonLikeAndSpecDiffVisitors(resolvers, rfcState, e => diffs.append(e), println))
    examples.foreach(i => traverser.traverseRootShape(Some(i), shapeId))
    diffs.foreach(println)

//    val renderAttempt = Try(DiffPreviewer.shapeOnlyFromShapeBuilder(examples).get._2)

    (commands.flatten, rfcState, diffs.toVector, null)
  }

}
