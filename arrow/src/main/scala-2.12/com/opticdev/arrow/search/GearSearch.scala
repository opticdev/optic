package com.opticdev.arrow.search

import com.opticdev.arrow.{GearResult, Result}
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.Lens
import me.xdrop.fuzzywuzzy.FuzzySearch

object GearSearch {
  def search(query: String)(implicit sourcegear: SourceGear) : Seq[Result] = search(query, sourcegear.gearSet.listGears)

  def search(query: String, gears: Set[Gear]) : Seq[Result] =
    gears
      .map(i=> GearResult(i, FuzzySearch.tokenSetPartialRatio(i.name, query)))
      .toSeq
      .filterNot(_.score < 50)
      .sortBy(_.score * -1) // to reverse it as it sorts
}
