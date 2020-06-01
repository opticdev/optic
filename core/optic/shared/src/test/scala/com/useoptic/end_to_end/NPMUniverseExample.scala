package com.useoptic.end_to_end

import com.useoptic.diff.JsonFileFixture
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.UnmatchedResponseBodyContentType
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.ux.DiffManager
import org.scalatest.FunSpec

class NPMUniverseExample extends FunSpec with JsonFileFixture {
  lazy val universe = universeFromExampleSession("npm-debug-capture")

  it("can load in the npm universe") {

    val interactions = universe.interactions.sortBy(_.uuid).slice(4, 10)

    val diffManager = new DiffManager(interactions)
    diffManager.updatedRfcState(universe.rfcState, ShapesResolvers.newCachingResolver(universe.rfcState))
    val diffsForEndpoint = diffManager.endpointDiffs(Seq.empty).headOption.map(ed => diffManager.managerForPathAndMethod(ed.pathId, ed.method, Seq.empty)).get

    val diffToEval = diffsForEndpoint.diffRegions.newRegions.collectFirst {
      case a if a.diff.isInstanceOf[UnmatchedResponseBodyContentType] => a
    }.get


    val preview = diffToEval.previewShape(interactions.head, false)
    val polyPreview =diffToEval.previewShape(interactions.head, true)
//    println(polyPreview)
    null
  }

}
