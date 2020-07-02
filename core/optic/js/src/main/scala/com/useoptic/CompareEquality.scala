package com.useoptic

import com.useoptic.diff.{DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.ux.{BodyDiff, BodyShapeDiffBlock, DiffBlock, NewRegionDiff}

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

  def betweenBodyDiffs(aBodyRegions: js.Array[BodyDiff], bBodyRegions: js.Array[BodyDiff]): Boolean = {
    if (aBodyRegions.size == bBodyRegions.size) {
      aBodyRegions.zip(bBodyRegions).forall {
        case (a, b) => a.isSameAs(b)
      }
    } else {
      false
    }
  }
  def betweenSelectedDiffs(aBodyRegions: js.UndefOr[BodyDiff], bBodyRegions: js.UndefOr[BodyDiff]): Boolean = {
    val a = aBodyRegions.toOption
    val b = bBodyRegions.toOption

    if ( (a.isDefined && b.isEmpty) || (a.isEmpty && b.isDefined) ) {
      false
    } else {
      a.map(_.diff) == b.map(_.diff) && a.map(_.firstInteractionPointer) == b.map(_.firstInteractionPointer)
    }
  }
}
