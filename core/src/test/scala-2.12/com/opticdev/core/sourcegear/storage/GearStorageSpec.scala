package com.opticdev.core.sourcegear.storage

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.Fixture.compilerUtils.GearUtils

class GearStorageSpec extends TestBase with GearUtils {

  val testFilePath = getCurrentDirectory + "/test-examples/resources/example_source/ImportSource.js"

  lazy val importGear = compiledLensFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")

  it("can write to storage") {
    assert(GearStorage.writeToStorage(importGear).exists)
  }

  it("can read back in") {
    assert(GearStorage.loadFromStorage("using-require").get == importGear)
  }

}
