package com.opticdev.arrow.search

import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.arrow.results.{GearResult, Result}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{CompiledLens, SGExportableLens, SourceGear}
import com.opticdev.sdk.descriptions.Lens
import me.xdrop.fuzzywuzzy.FuzzySearch

object GearSearch {
  def search(query: String, context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, editorSlug: String) : Vector[GearResult] =
    search(query, context, sourcegear.lensSet.listLenses)

  def search(query: String, context: ArrowContextBase, gears: Set[SGExportableLens])(implicit sourcegear: SourceGear, project: OpticProject, editorSlug: String) : Vector[GearResult] =
    gears
      .filter(_.name.isDefined)
      .map(i=> {
        GearResult(i, FuzzySearch.tokenSetPartialRatio(i.name.get, query), context)
      })
      .toVector
      .filterNot(_.score < 50)
      .sortBy(_.score * -1) // to reverse it as it sorts
}
