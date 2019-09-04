package com.seamless.diff

import com.seamless.contexts.shapes.Commands.DynamicParameterList
import com.seamless.contexts.shapes.{ShapeEntity, ShapeValue, ShapesAggregate, ShapesState}
import io.circe.{Json, JsonNumber, JsonObject}
import org.scalatest.FunSpec

class ShapeDifferSpec extends FunSpec {
  describe("diffing") {
    describe("when expecting an empty object") {
      describe("when given an empty object") {
        it("should return an empty diff") {
          implicit val shapesState: ShapesState = ShapesAggregate.initialState
          val shape = ShapeValue(isUserDefined = true, "$object", DynamicParameterList(Seq.empty), Seq.empty, "x")
          val expected = ShapeEntity("x", shape, isRemoved = false)
          val actual: Json = Json.fromJsonObject(
            JsonObject()
              /*.+:("x", Json.fromJsonNumber(JsonNumber.fromIntegralStringUnsafe("3")))
              .+:("y", Json.fromString("asdf"))*/
          )
          val diff = ShapeDiffer.diff(expected, actual)
          assert(diff == Seq.empty)
        }
      }
    }
  }
}
