package com.opticdev.arrow

import com.opticdev.arrow.context.{ArrowContextBase, NoContext}
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.arrow.results.Result
import com.opticdev.arrow.search.GearSearch
import com.opticdev.core.sourcegear.SourceGear

class Arrow(sourcegear: SourceGear) {

  val indexed = IndexSourceGear.runFor(sourcegear)

  def search(query: String, context: ArrowContextBase = NoContext): Vector[Result] = {
    GearSearch.search(query)(sourcegear)
  }

}
