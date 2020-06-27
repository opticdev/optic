package com.useoptic

import com.useoptic.diff.{DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.ux.{BodyShapeDiffBlock, DiffBlock, NewRegionDiff}

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object CompareEquality {
  def between(a: InteractionDiffResult, b: InteractionDiffResult): Boolean = a == b
  def between(a: DiffResult, b: DiffResult): Boolean = a == b
  def between(a: ShapeDiffResult, b: ShapeDiffResult): Boolean = a == b
  def between(a: DiffBlock, b: DiffBlock): Boolean = a == b
  def between(a: BodyShapeDiffBlock, b: BodyShapeDiffBlock): Boolean = a == b
  def between(a: InteractiveDiffInterpretation, b: InteractiveDiffInterpretation): Boolean = a == b

  def betweenWithoutCommands(a: InteractiveDiffInterpretation, b: InteractiveDiffInterpretation): Boolean = {
    a.action == b.action && a.pastTenseAction == a.pastTenseAction && a.commands.size == b.commands.size
  }


  def between(aNewRegions: js.Array[NewRegionDiff], bNewRegions: js.Array[NewRegionDiff]): Boolean = {
    if (aNewRegions.size == bNewRegions.size) {
      aNewRegions.zip(bNewRegions).forall {
        case (a, b) => a.isSameAs(b)
      }
    } else {
      false
    }
  }
}
