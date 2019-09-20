package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.ShapesState
import com.seamless.diff.RequestDiffer.RequestDiffResult
import com.seamless.diff.ShapeDiffer.UnsetShape
import com.seamless.diff._
import com.seamless.diff.initial.ShapeBuilder
import io.circe.Json

class UnsetBodyInterpreter(_shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    implicit val shapesState: ShapesState = _shapesState
    diff match {
      case d: RequestDiffer.UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: UnsetShape => {
            NameTheShapes(sd.actual)
          }
          case _ => Seq.empty
        }
      }
      case d: RequestDiffer.UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape => {
            NameTheShapes(sd.actual)
          }
          case _ => Seq.empty

        }
      }
      case _ => Seq.empty
    }
  }

  def NameTheShapes(actual: Json) = {
    val result = new ShapeBuilder(actual).run
    result.nameRequests.map(shapeToName => {
      DiffInterpretation(
        "Unrecognized Shape Observed",
        "Optic observed a new shape. Give it a name",
        result.commands,
        FrontEndMetadata(nameRequests = Seq(shapeToName), example = Some(shapeToName.example))
      )
    })
  }
}
