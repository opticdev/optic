package com.opticdev.arrow.search

import com.opticdev.arrow.context.NoContext
import com.opticdev.arrow.results.GearResult
import com.opticdev.core.sourcegear.CompiledLens
import org.scalatest.FunSpec

class GearSearchSpec extends FunSpec {

  def gearWithName(name: String) = CompiledLens(name, null, null, null, null, null)
  val testGears = Set(
    gearWithName("Route"),
    gearWithName("REST Route"),
    gearWithName("Parameter"),
    gearWithName("Model Definition"),
    gearWithName("Model Creation"),
    gearWithName("Model"),
  )

  it("will rank gears correctly") {
    val searchResults1 = GearSearch.search("route", NoContext, testGears)(null, null)
    assert(
      searchResults1.map(_.asInstanceOf[GearResult].gear.name) ==
        Seq("REST Route", "Route")
    )

    //@todo figure out why this is non-deterministic. shouldn't be an unordered test
    val searchResults2 = GearSearch.search("model", NoContext, testGears)(null, null)
    assert(
      searchResults2.map(_.asInstanceOf[GearResult].gear.name).toSet ==
        Set("Model Creation", "Model Definition", "Model")
    )

  }

}
