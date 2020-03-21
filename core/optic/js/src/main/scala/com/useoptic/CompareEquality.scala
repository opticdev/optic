package com.useoptic

import com.useoptic.diff.{DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.ux.{BodyShapeDiffBlock, DiffBlock}

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
    a.description == b.description && a.description == a.description
  }
}
