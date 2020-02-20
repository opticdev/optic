package com.useoptic.end_to_end.fixtures

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.diff.RequestDiffer.{UnmatchedQueryParameterShape, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.{DiffInterpretation, ShapeDiffer}
import com.useoptic.diff.ShapeDiffer.ShapeDiffResult
import com.useoptic.diff.interpreters.CompoundInterpreter
import io.circe.Json
import org.scalatest.{FunSpec, WordSpec}

object ShapeTestHelpers {
  implicit class ShapeDiffHelper(diffVector: Vector[ShapeDiffResult]) {
    def isSingleDiff = diffVector.size == 1
    def isEmpty = diffVector.size == 1
    def nonEmpty = diffVector.size == 1
  }
  implicit class DiffInterpretationHelper(diffVector: Vector[DiffInterpretation]) {
    def isSingleInterpretation = diffVector.size == 1
    def isMultipleInterpretation = diffVector.size > 1
    def isEmpty = diffVector.size == 1
    def nonEmpty = diffVector.size == 1
  }
}

trait OpticShapeTest extends WordSpec {


  def compare(shape: (ShapeEntity, RfcState)) = new {
    def to(actual: Json) = {

      val diff = ShapeDiffer.diffJson(shape._1, Some(actual))(shape._2.shapesState).toVector

      val compoundInterpreter = new CompoundInterpreter(shape._2.shapesState)

      new {
        def forQuery = {
          val interpretation = diff.map(i => UnmatchedQueryParameterShape("123", "query", i, actual)).flatMap(compoundInterpreter.interpret)
          (diff, interpretation)
        }
        def forResponse = {
          val interpretation = diff.map(i => UnmatchedResponseBodyShape("123", "application/json", 200, i)).flatMap(compoundInterpreter.interpret)
          (diff, interpretation)
        }
        def forRequest = {
          val interpretation = diff.map(i => UnmatchedRequestBodyShape("123", "application/json", i)).flatMap(compoundInterpreter.interpret)
          (diff, interpretation)
        }
      }

    }
  }
}
