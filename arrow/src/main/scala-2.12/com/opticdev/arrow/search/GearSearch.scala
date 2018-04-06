package com.opticdev.arrow.search

import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.arrow.results.{GearResult, Result}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import com.opticdev.sdk.descriptions.Lens
import me.xdrop.fuzzywuzzy.FuzzySearch

object GearSearch {
  def search(query: String, context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject) : Vector[GearResult] =
    search(query, context, sourcegear.lensSet.listGears)

  def search(query: String, context: ArrowContextBase, gears: Set[CompiledLens])(implicit sourcegear: SourceGear, project: OpticProject) : Vector[GearResult] =
    gears
      .map(i=> {
        GearResult(i, FuzzySearch.tokenSetPartialRatio(i.name, query), context)
      })
      .toVector
      .filterNot(_.score < 50)
      .sortBy(_.score * -1) // to reverse it as it sorts
}
