package com.opticdev.arrow

import com.opticdev.arrow.context.{ArrowContextBase, NoContext}
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.arrow.results.Result
import com.opticdev.arrow.search.GearSearch
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.{OpticProject, Project}

class Arrow(project: OpticProject) {

  val sourcegear = project.projectSourcegear

  val indexed = IndexSourceGear.runFor(sourcegear)

  def search(query: String, context: ArrowContextBase = NoContext): Vector[Result] = {
    GearSearch.search(query, context)(sourcegear, project)
  }

}
