package com.opticdev.arrow.search

import com.opticdev.arrow.context.NoContext
import com.opticdev.arrow.results.GearResult
import com.opticdev.core.sourcegear.Gear
import org.scalatest.FunSpec

class GearSearchSpec extends FunSpec {

  def gearWithName(name: String) = Gear(name, null, null, null)
  val testGears = Set(
    gearWithName("Route"),
    gearWithName("REST Route"),
    gearWithName("Parameter"),
    gearWithName("Model Definition"),
    gearWithName("Model Creation"),
    gearWithName("Model"),
  )

  it("will rank gears correctly") {
    val searchResults1 = GearSearch.search("route", NoContext, testGears)(null)
    assert(
      searchResults1.map(_.asInstanceOf[GearResult].gear.name) ==
        Seq("REST Route", "Route")
    )

    val searchResults2 = GearSearch.search("model", NoContext, testGears)(null)
    assert(
      searchResults2.map(_.asInstanceOf[GearResult].gear.name) ==
        Seq("Model Creation", "Model Definition", "Model")
    )

  }

}
