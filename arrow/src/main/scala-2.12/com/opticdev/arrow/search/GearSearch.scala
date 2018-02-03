package com.opticdev.arrow.search

import com.opticdev.arrow.results.{GearResult, Result}
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.Lens
import me.xdrop.fuzzywuzzy.FuzzySearch

object GearSearch {
  def search(query: String)(implicit sourcegear: SourceGear) : Vector[Result] = search(query, sourcegear.gearSet.listGears)

  def search(query: String, gears: Set[Gear]) : Vector[Result] =
    gears
      .map(i=> {
        GearResult(i, FuzzySearch.tokenSetPartialRatio(i.name, query))
      })
      .toVector
      .filterNot(_.score < 50)
      .sortBy(_.score * -1) // to reverse it as it sorts
}
