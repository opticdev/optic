package com.useoptic.end_to_end.fixtures

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.{ShapeEntity, ShapesHelper}
import com.useoptic.diff.RequestDiffer.{UnmatchedQueryParameterShape, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.{DiffInterpretation, ShapeDiffer}
import com.useoptic.diff.ShapeDiffer.ShapeDiffResult
import com.useoptic.diff.interpreters.CompoundInterpreter
import io.circe.Json
import org.scalatest.{FreeSpec, FunSpec, Status, WordSpec}

object ShapeTestHelpers {
  implicit class ShapeDiffHelper(diffVector: Vector[ShapeDiffResult]) {
    def isSingleDiff = diffVector.size == 1
    def isEmpty = diffVector.size == 1
    def nonEmpty = diffVector.size == 1

    def matchesSnapshot(name2: String = "_")(implicit currentTestName: String): Boolean = {
      OpticSnapshotHelper.checkD(currentTestName, name2, diffVector)
    }

  }
  implicit class DiffInterpretationHelper(interpretationsVector: Vector[DiffInterpretation]) {
    def isSingleInterpretation = interpretationsVector.size == 1
    def isMultipleInterpretation = interpretationsVector.size > 1
    def isEmpty = interpretationsVector.size == 1
    def nonEmpty = interpretationsVector.size == 1

    def matchesSnapshot(name2: String = "_")(implicit currentTestName: String): Boolean = {
      OpticSnapshotHelper.checkI(currentTestName, name2, interpretationsVector)
    }

  }
}

trait OpticShapeTest extends WordSpec {

  def compare(shape: (ShapeEntity, RfcState)) = new {
    def to(actual: Json) = {

      //reset IDs so they're deterministic
      ShapesHelper.test_resetCounter
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

  private def setEnv(key: String, value: String) = {
    val field = System.getenv().getClass.getDeclaredField("m")
    field.setAccessible(true)
    val map = field.get(System.getenv()).asInstanceOf[java.util.Map[java.lang.String, java.lang.String]]
    map.put(key, value)
  }

  private var _currentTestName: Option[String] = None
  implicit def currentTestName = _currentTestName.getOrElse("No Name")

  protected override def runTest(testName: String, args: org.scalatest.Args): Status = {
    _currentTestName = Some(testName)
    super.runTest(testName, args)
  }

  setEnv("TESTS_ARE_RUNNING", "TRUE")
}
