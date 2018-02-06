package com.opticdev.core.sourcegear

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import org.scalatest.FunSpec

class GearSpec extends TestBase with GearUtils {
  it("hashes used for ids are stable") {
    val gearIds = (0 to 10).map(i=> gearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json").id)
    assert(gearIds.distinct.size == 1)
  }
}
