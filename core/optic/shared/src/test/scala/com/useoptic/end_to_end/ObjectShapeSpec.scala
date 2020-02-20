package com.useoptic.end_to_end

import com.useoptic.end_to_end.fixtures.{JsonExamples, OpticShapeTest, ShapeExamples}
import com.useoptic.end_to_end.fixtures.ShapeTestHelpers._
class ObjectShapeSpec extends OpticShapeTest {

  "an object ShapeEntity" when {
    "diffed against a similar object with one unknown field" should {
      val (diff, interpretations) = compare (ShapeExamples.todoShape) to (JsonExamples.basicTodoWithDescription) forRequest

      "have a single diff" in {
        assert(diff isSingleDiff)
        assert(diff matchesSnapshot(testNames, "1"))
      }

      "and a single interpretation" in {
        assert(interpretations isSingleInterpretation)
        assert(interpretations matchesSnapshot(testNames, "2"))
      }

    }
    "diffed against a similar object with one missing field" should {
      val (diff, interpretations) = compare (ShapeExamples.todoShape) to (JsonExamples.basicTodoWithoutStatus) forRequest

      "have a single diff" in {
        assert(diff isSingleDiff)
      }

      "and a single interpretation" in {

        println(interpretations.head.commands)

        assert(interpretations isMultipleInterpretation)
      }

    }
  }

}
